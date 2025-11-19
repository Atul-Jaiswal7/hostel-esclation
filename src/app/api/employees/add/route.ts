import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/admin';
import * as firebaseAdmin from 'firebase-admin';

// Helper function to retry Firebase operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

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
        { status: 403 }
      );
    }
    const callerEmail = (decodedToken as any).email || 'unknown';
    console.log(`API: Admin access granted for user: ${callerEmail}`);

    const { fullName, email, role, department, isAdmin, isCRM } = await request.json();

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    // If neither Admin nor CRM is selected, role and department are required
    if (!isAdmin && !isCRM && (!role || !department)) {
      return NextResponse.json(
        { error: 'Role and department are required for regular employees' },
        { status: 400 }
      );
    }

    try {
      console.log(`Adding new employee: ${fullName} (${email})`);
      
      // Generate a secure random password
      const password = Math.random().toString(36).slice(-8) + "A1!";

      // Check if user already exists in Firebase Auth with retry and timeout
      let userRecord;
      try {
        userRecord = await retryOperation(async () => {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firebase Auth timeout')), 30000)
          );
          
          const getUserPromise = adminAuth.getUserByEmail(email);
          return await Promise.race([getUserPromise, timeoutPromise]) as any;
        });
        console.log(`User already exists: ${userRecord.uid}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create the user in Firebase Authentication using Admin SDK with retry and timeout
          userRecord = await retryOperation(async () => {
            const createUserPromise = adminAuth.createUser({
              email: email,
              password: password,
              displayName: fullName,
              disabled: false,
            });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Firebase Auth creation timeout')), 30000)
            );
            
            return await Promise.race([createUserPromise, timeoutPromise]) as any;
          });
          console.log(`Created new user: ${userRecord.uid}`);
        } else {
          throw error;
        }
      }

      // Set custom claims for the new user with retry and timeout
      const customClaims: any = {};
      if (role) customClaims.role = role;
      if (isAdmin) customClaims.isAdmin = true;
      if (isCRM) customClaims.isCRM = true;
      
      await retryOperation(async () => {
        const setClaimsPromise = adminAuth.setCustomUserClaims(userRecord.uid, customClaims);
        const claimsTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase Auth claims timeout')), 15000)
        );
        
        return await Promise.race([setClaimsPromise, claimsTimeoutPromise]);
      });

      // Create employee data for Firestore
      const employeeData = {
        id: userRecord.uid,
        name: fullName,
        email: email,
        role: role || (isAdmin ? 'Admin' : isCRM ? 'CRM' : 'Employee'),
        department: department || (isAdmin ? 'Administration' : isCRM ? 'CRM' : 'General'),
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        isAdmin: isAdmin || false,
        isCRM: isCRM || false,
      };

      // Add to Firestore with retry and timeout
      await retryOperation(async () => {
        const firestorePromise = adminDb.collection("employees").doc(userRecord.uid).set(employeeData);
        const firestoreTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore timeout')), 15000)
        );
        
        return await Promise.race([firestorePromise, firestoreTimeoutPromise]);
      });

      // No longer write to JSON files; Firestore and custom claims are source of truth

      // Send password reset email using Firebase Auth
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password`,
        handleCodeInApp: true,
      };

      await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
      
      // Note: Firebase Admin SDK's generatePasswordResetLink doesn't send emails automatically
      // We need to use the client-side Firebase Auth sendPasswordResetEmail function
      // This will be handled by the client-side code when the user first tries to log in
      // or we can trigger it from the client side after user creation

      console.log(`Successfully created employee: ${userRecord.uid}`);
      console.log(`Password reset link generated for: ${email}`);

      return NextResponse.json({ 
        success: true, 
        message: `${fullName} has been invited. A password reset email will be sent when they first attempt to log in.`,
        employeeId: userRecord.uid,
        email: email
      });
      
    } catch (error: any) {
      console.error("Error creating employee:", error);
      
      let errorMessage = "Failed to create employee";
      if (error.code === 'auth/email-already-exists') {
        errorMessage = "An account with this email already exists";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("Error in add employee API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
