import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check admin via custom claims or Firestore
    const isAdminClaim = Boolean((decodedToken as any).isAdmin) || (decodedToken as any).role === 'Admin';
    let isAdminByFirestore = false;
    if (!isAdminClaim) {
      try {
        const callerDoc = await adminDb.collection('employees').doc(decodedToken.uid).get();
        if (callerDoc.exists) {
          const data = callerDoc.data() as any;
          isAdminByFirestore = Boolean(data?.isAdmin) || data?.role === 'Admin';
        }
      } catch (e) {}
    }
    if (!isAdminClaim && !isAdminByFirestore) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const { employeeId, action } = await request.json();

    if (!employeeId || !action) {
      return NextResponse.json(
        { error: 'employeeId and action are required' },
        { status: 400 }
      );
    }

    if (employeeId === decodedToken.uid) {
      return NextResponse.json(
        { error: 'Cannot perform action on your own account' },
        { status: 400 }
      );
    }

    if (action === 'disable') {
      try {
        // Search for the employee document by the Firebase Auth UID
        const employeesQuery = adminDb.collection("employees").where("id", "==", employeeId);
        const querySnapshot = await employeesQuery.get();
        
        if (querySnapshot.empty) {
          console.log(`No employee found with Firebase Auth UID: ${employeeId}`);
          return NextResponse.json(
            { error: 'Employee not found in database' },
            { status: 404 }
          );
        }
        
        // Disable the user in Auth
        await adminAuth.updateUser(employeeId, { disabled: true });
        
        return NextResponse.json({ 
          success: true, 
          message: "Employee has been disabled." 
        });
      } catch (error: any) {
        console.error("Error disabling employee:", error);
        return NextResponse.json(
          { error: error.message || "Failed to disable employee." },
          { status: 500 }
        );
      }
    } else if (action === 'delete') {
      try {
        console.log(`Deleting employee with ID: ${employeeId}`);
        
        // Validate employee ID format
        if (!employeeId || typeof employeeId !== 'string' || employeeId.length < 10) {
          return NextResponse.json(
            { error: 'Invalid employee ID format' },
            { status: 400 }
          );
        }
        
        // Search for the employee document by the Firebase Auth UID
        const employeesQuery = adminDb.collection("employees").where("id", "==", employeeId);
        const querySnapshot = await employeesQuery.get();
        
        if (querySnapshot.empty) {
          console.log(`No employee found with Firebase Auth UID: ${employeeId}`);
          return NextResponse.json(
            { error: 'Employee not found in database' },
            { status: 404 }
          );
        }
        
        // Get the first matching document
        const employeeDoc = querySnapshot.docs[0];
        const firestoreRef = employeeDoc.ref;
        console.log(`Found employee document with ID: ${employeeDoc.id}`);
        
        // Delete from Firestore
        await firestoreRef.delete();
        console.log(`Successfully deleted employee from Firestore: ${employeeDoc.id}`);
        
        // Then delete from Auth
        let authDeleted = false;
        try {
          const userRecord = await adminAuth.getUser(employeeId);
          if (userRecord) {
            await adminAuth.deleteUser(employeeId);
            console.log(`Successfully deleted employee from Auth: ${employeeId}`);
            authDeleted = true;
          }
        } catch (authError: any) {
          if (authError.code === 'auth/user-not-found') {
            console.log(`User not found in Auth (already deleted): ${employeeId}`);
          } else {
            console.warn(`Warning: Could not delete user from Auth: ${authError.message}`);
          }
        }
        
        const message = authDeleted 
          ? "Employee has been deleted from both Firestore and Auth."
          : "Employee has been deleted from Firestore. User account was already removed from Auth.";
        
        return NextResponse.json({ 
          success: true, 
          message: message
        });
      } catch (error: any) {
        console.error("Error deleting employee:", error);
        return NextResponse.json(
          { error: error.message || "Failed to delete employee." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in manage-status API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
