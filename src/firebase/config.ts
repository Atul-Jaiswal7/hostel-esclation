// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Only initialize Firebase if we have valid configuration
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

// Check if we have the minimum required Firebase config
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId;

if (typeof window !== 'undefined' && hasValidConfig) {
  try {
    // Initialize Firebase
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    // Provide fallback objects
    app = null;
    db = null;
    auth = null;
    functions = null;
  }
} else {
  // Provide fallback objects when config is missing
  app = null;
  db = null;
  auth = null;
  functions = null;
  
  if (typeof window !== 'undefined') {
    console.warn('Firebase not initialized: Missing environment variables. Please check your .env.local file.');
  }
}

export { app, db, auth, functions };