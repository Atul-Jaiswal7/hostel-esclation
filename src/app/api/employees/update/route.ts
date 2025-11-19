import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/admin';

export async function PUT(request: NextRequest) {
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
        { status: 403 }
      );
    }

    const { employeeId, updates } = await request.json();

    if (!employeeId || !updates) {
      return NextResponse.json(
        { error: 'employeeId and updates are required' },
        { status: 400 }
      );
    }

    // Validate update fields
    const allowedFields = ['department', 'role'];
    const updateFields = Object.keys(updates);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}. Only department and role can be updated.` },
        { status: 400 }
      );
    }

    if (employeeId === decodedToken.uid) {
      return NextResponse.json(
        { error: 'Cannot update your own account' },
        { status: 400 }
      );
    }

    try {
      console.log(`Updating employee with ID: ${employeeId}`);
      console.log('Update fields:', updates);
      
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
      
      // Update the document
      await firestoreRef.update(updates);
      console.log(`Successfully updated employee: ${employeeDoc.id}`);
      
      // If role is being updated, also update custom claims in Auth
      if (updates.role) {
        try {
          await adminAuth.setCustomUserClaims(employeeId, { role: updates.role });
          console.log(`Successfully updated role in Auth: ${employeeId} -> ${updates.role}`);
        } catch (authError: any) {
          console.warn(`Warning: Could not update role in Auth: ${authError.message}`);
          // Don't fail the entire operation if Auth update fails
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Employee has been updated successfully.",
        updatedFields: updateFields
      });
      
    } catch (error: any) {
      console.error("Error updating employee:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update employee." },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("Error in update employee API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
