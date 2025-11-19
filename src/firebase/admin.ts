
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app: admin.app.App;
let isInitialized = false;

if (!admin.apps.length) {
  try {
    // For Vercel deployment, use service account from environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || 'test_project',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'test_key_id',
      private_key: (process.env.FIREBASE_PRIVATE_KEY || 'test_key')?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL || 'test@test.com',
      client_id: process.env.FIREBASE_CLIENT_ID || 'test_client_id',
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/test@test.com',
    };

    // Only initialize if we have valid credentials (not test values)
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_PROJECT_ID !== 'test_project' &&
        process.env.FIREBASE_PRIVATE_KEY !== 'test_key') {
      
      console.log('🔥 Initializing Firebase Admin with real credentials');
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      isInitialized = true;
    } else {
      // Create a mock app for build time
      console.warn('⚠️  Firebase Admin using mock credentials - not suitable for production');
      app = admin.initializeApp({
        projectId: 'test_project',
        credential: admin.credential.applicationDefault(),
      });
      isInitialized = false;
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
    // Create a mock app for build time
    app = admin.initializeApp({
      projectId: 'test_project',
      credential: admin.credential.applicationDefault(),
    });
    isInitialized = false;
  }
} else {
  app = admin.apps[0]!;
  isInitialized = true;
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

// Export initialization status for debugging
export { isInitialized };

// Add a function to check if we're properly connected
export const checkFirebaseConnection = () => {
  if (!isInitialized) {
    console.error('❌ Firebase Admin not properly initialized!');
    console.error('   Missing or invalid environment variables:');
    console.error('   - FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
    console.error('   - FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');
    console.error('   - FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET');
    return false;
  }
  console.log('✅ Firebase Admin properly initialized');
  console.log('   Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('   Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('   Private Key Length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0);
  return true;
};

// Add a function to test Firestore connection
export const testFirestoreConnection = async () => {
  try {
    console.log('🧪 Testing Firestore connection...');
    const testDoc = adminDb.collection('_test_connection').doc('test');
    await testDoc.set({ timestamp: new Date(), test: true });
    console.log('✅ Firestore write test successful');
    await testDoc.delete();
    console.log('✅ Firestore delete test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};
