
import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

interface InviteEmployeeData {
    email: string;
    fullName: string;
    role: string;
    department: string;
}

export const createEmployeeInvite = onCall<InviteEmployeeData>(
  async (request) => {
    // 1. Security: only signed-in users can invite
    const callerUid = request.auth?.uid;
    if (!callerUid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    
    // Check for Admin or CRM role on the caller
    const callerAuth = await admin.auth().getUser(callerUid);
    const callerRole = callerAuth.customClaims?.role;
    if (callerRole !== 'Admin' && callerRole !== 'CRM') {
        throw new HttpsError('permission-denied', 'You must be an Admin or CRM to invite employees.');
    }

    const { email, fullName, role, department } = request.data;
    if (!email || !fullName || !role || !department) {
      throw new HttpsError("invalid-argument", "Email, fullName, role, and department are required.");
    }

    // 2. Auto-provision the caller as an Admin if they don't exist in 'employees' yet
    const callerDocRef = db.collection("employees").doc(callerUid);
    const callerDoc = await callerDocRef.get();

    if (!callerDoc.exists) {
        try {
            await callerDocRef.set({
                id: callerUid,
                name: callerAuth.displayName || 'Admin User',
                email: callerAuth.email,
                role: 'Admin', // Default role for the first user
                department: 'Management', // Default department
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Also set admin claim for the first user if not set
             if (!callerAuth.customClaims?.role) {
                await admin.auth().setCustomUserClaims(callerUid, { role: 'Admin' });
            }
        } catch (error) {
            console.error("Error auto-provisioning admin user:", error);
            // This is likely a Firestore security rule violation.
            throw new HttpsError('internal', 'Could not create a profile for the calling user. Please check Firestore rules.');
        }
    }


    // 3. Create the new Auth user for the invitee
    let user: admin.auth.UserRecord;
    try {
      user = await admin.auth().createUser({ email, displayName: fullName });
    } catch (e: any) {
      if (e.code === "auth/email-already-exists") {
        // If the user already exists in Auth, we can proceed to add them to the employees collection
        // if they aren't there already. This handles re-invites or manual auth creation.
        user = await admin.auth().getUserByEmail(email);
      } else {
        console.error("Error creating user:", e);
        throw new HttpsError("internal", e.message ?? "Failed to create user in Authentication.");
      }
    }

    // 4. Set custom claims for the new user
    try {
        await admin.auth().setCustomUserClaims(user.uid, { role });
    } catch(e: any) {
        console.error("Error setting custom claims:", e);
        // Clean up the created user if setting claims fails to avoid an inconsistent state
        await admin.auth().deleteUser(user.uid);
        throw new HttpsError("internal", "Failed to set user role.");
    }


    // 5. Create Firestore profile for the new user (doc id = uid)
    const employeeData = {
      id: user.uid,
      name: fullName,
      email,
      role,
      department,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
        await db.collection("employees").doc(user.uid).set(employeeData, { merge: true });
    } catch(e: any) {
        console.error("Error creating employee in firestore:", e);
        // If this fails, we should ideally delete the Auth user to keep things clean.
        await admin.auth().deleteUser(user.uid);
        throw new HttpsError("internal", "Failed to create employee profile in database.");
    }
    
    // 6. Return success
    // The client will trigger the password reset email.
    return { success: true, uid: user.uid };
  }
);


interface ManageEmployeeStatusData {
    employeeId: string;
    action: 'disable' | 'delete';
}

export const manageEmployeeStatus = onCall<ManageEmployeeStatusData>(
    async (request) => {
        const callerUid = request.auth?.uid;
        if (!callerUid) {
            throw new HttpsError("unauthenticated", "Sign in required.");
        }

        const callerAuth = await admin.auth().getUser(callerUid);
        const callerRole = callerAuth.customClaims?.role;
        if (callerRole !== 'Admin') {
            throw new HttpsError('permission-denied', 'You must be an Admin to manage employee status.');
        }

        const { employeeId, action } = request.data;
        if (!employeeId || !action) {
            throw new HttpsError("invalid-argument", "employeeId and action are required.");
        }
        
        if (employeeId === callerUid) {
            throw new HttpsError("permission-denied", "You cannot perform this action on your own account.");
        }

        if (action === 'disable') {
            try {
                await admin.auth().updateUser(employeeId, { disabled: true });
                return { success: true, message: "Employee has been disabled." };
            } catch (error: any) {
                console.error("Error disabling employee:", error);
                throw new HttpsError("internal", error.message || "Failed to disable employee.");
            }
        } else if (action === 'delete') {
            try {
                // Deleting from Auth will trigger a function to delete from Firestore
                await admin.auth().deleteUser(employeeId);
                await db.collection("employees").doc(employeeId).delete();
                return { success: true, message: "Employee has been deleted." };
            } catch (error: any) {
                console.error("Error deleting employee:", error);
                throw new HttpsError("internal", error.message || "Failed to delete employee.");
            }
        } else {
            throw new HttpsError("invalid-argument", "Invalid action specified.");
        }
    }
);