import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, isInitialized } from '@/firebase/admin';
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
    // Check if Firebase Admin is properly initialized
    if (!isInitialized) {
      console.error('❌ Firebase Admin not properly initialized');
      console.error('   Server Project ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
      console.error('   Client Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET');
      return NextResponse.json(
        { error: 'Server configuration error: Firebase Admin not initialized. Please check server environment variables.' },
        { status: 500 }
      );
    }

    // Verify project IDs match
    const serverProjectId = process.env.FIREBASE_PROJECT_ID;
    const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (serverProjectId && clientProjectId && serverProjectId !== clientProjectId) {
      console.error('❌ Project ID mismatch detected');
      console.error('   Server Project ID:', serverProjectId);
      console.error('   Client Project ID:', clientProjectId);
      return NextResponse.json(
        { error: 'Configuration error: Server and client Firebase project IDs do not match.' },
        { status: 500 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    
    // Validate token exists and is not empty
    if (!idToken || idToken.length === 0) {
      console.error('❌ Token extraction failed');
      console.error('   Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
      return NextResponse.json(
        { error: 'Invalid token format: Token is missing or empty' },
        { status: 401 }
      );
    }
    
    // Log token info (first/last chars only for security)
    console.log('🔑 Token received:', {
      length: idToken.length,
      startsWith: idToken.substring(0, 10),
      endsWith: idToken.substring(idToken.length - 10)
    });
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken, true); // Check revoked tokens
      
      // Verify the token's project matches our server project
      const tokenProjectId = (decodedToken as any).firebase?.project_id || (decodedToken as any).aud;
      if (tokenProjectId && serverProjectId && tokenProjectId !== serverProjectId) {
        console.error('❌ Token project mismatch');
        console.error('   Token Project ID:', tokenProjectId);
        console.error('   Server Project ID:', serverProjectId);
        return NextResponse.json(
          { error: 'Token project does not match server configuration. Please ensure you are logged into the correct project.' },
          { status: 401 }
        );
      }
    } catch (error: any) {
      console.error('❌ Token verification failed:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Server Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.error('   Client Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
      console.error('   Token length:', idToken.length);
      
      // Provide more specific error messages
      let errorMessage = 'Invalid authentication token';
      if (error.code === 'auth/argument-error') {
        // This usually means the service account credentials don't match the project
        const serviceAccountEmail = process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET';
        const hasMismatch = serviceAccountEmail.includes('securestream-bmwf2') && serverProjectId === 'hostel-b2f9f';
        
        if (hasMismatch) {
          errorMessage = 'Configuration error: Firebase Admin SDK service account credentials are from a different project. Please update FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your .env file with credentials from the hostel-b2f9f project.';
        } else {
          errorMessage = 'Invalid token format. This may indicate a mismatch between your Firebase Admin SDK credentials and the project ID. Please verify your service account credentials match the project.';
        }
      } else if (error.code === 'auth/id-token-expired') {
        errorMessage = 'Token has expired. Please refresh and try again.';
      } else if (error.code === 'auth/id-token-revoked') {
        errorMessage = 'Token has been revoked. Please log in again.';
      } else if (error.message && error.message.includes('insufficient permission')) {
        errorMessage = 'Service account lacks required permissions. Please grant the service account these IAM roles in Google Cloud Console: "Firebase Admin SDK Administrator Service Agent", "Service Account Token Creator", and "Firebase Authentication Admin". See FIX_PERMISSIONS.md for detailed instructions.';
      } else if (error.message) {
        errorMessage = `Token verification failed: ${error.message}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
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

    const { fullName, email, role, department, hostel, isAdmin } = await request.json();

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    // Check if role is Hostel Office
    const isHostelOffice = role === 'Hostel Office';

    // Validation based on role
    if (!isAdmin) {
      if (!role) {
        return NextResponse.json(
          { error: 'Role is required for regular employees' },
          { status: 400 }
        );
      }
      if (isHostelOffice && !hostel) {
        return NextResponse.json(
          { error: 'Hostel is required for Hostel Office employees' },
          { status: 400 }
        );
      }
      if (!isHostelOffice && !department) {
        return NextResponse.json(
          { error: 'Department is required for regular employees' },
          { status: 400 }
        );
      }
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
      if (isHostelOffice) customClaims.isHostelOffice = true;
      
      await retryOperation(async () => {
        const setClaimsPromise = adminAuth.setCustomUserClaims(userRecord.uid, customClaims);
        const claimsTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase Auth claims timeout')), 15000)
        );
        
        return await Promise.race([setClaimsPromise, claimsTimeoutPromise]);
      });

      // Create employee data for Firestore
      const employeeData: any = {
        id: userRecord.uid,
        name: fullName,
        email: email,
        role: role || (isAdmin ? 'Admin' : 'Employee'),
        department: isHostelOffice ? (hostel || 'Hostel Office') : (department || (isAdmin ? 'Administration' : 'General')),
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        isAdmin: isAdmin || false,
      };
      
      // Add hostel field if role is Hostel Office
      if (isHostelOffice && hostel) {
        employeeData.hostel = hostel;
      }

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
