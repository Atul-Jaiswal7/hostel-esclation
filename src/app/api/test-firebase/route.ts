import { NextResponse } from 'next/server';
import { checkFirebaseConnection, testFirestoreConnection, isInitialized, adminDb } from '@/firebase/admin';

export async function GET() {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Check initialization status
    const initStatus = checkFirebaseConnection();
    console.log('Initialization status:', initStatus);
    console.log('isInitialized export:', isInitialized);
    
    // Test Firestore connection
    const firestoreStatus = await testFirestoreConnection();
    
    // Test actual delete operation on a test document
    let deleteTestResult = 'not tested';
    try {
      // Create a test document
      const testDocRef = adminDb.collection('_test_delete').doc('test');
      await testDocRef.set({ test: true, timestamp: new Date() });
      console.log('✅ Test document created');
      
      // Try to delete it
      await testDocRef.delete();
      console.log('✅ Test document deleted successfully');
      deleteTestResult = 'success';
    } catch (error: any) {
      console.error('❌ Delete test failed:', error);
      deleteTestResult = `failed: ${error.message}`;
    }
    
    // Test searching for an actual employee
    let employeeSearchResult = 'not tested';
    try {
      const employeesQuery = adminDb.collection("employees").limit(1);
      const querySnapshot = await employeesQuery.get();
      
      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0];
        const employeeData = employeeDoc.data();
        console.log('✅ Found employee document:', {
          docId: employeeDoc.id,
          authUid: employeeData.id,
          name: employeeData.name,
          email: employeeData.email
        });
        employeeSearchResult = `found: ${employeeData.name} (doc: ${employeeDoc.id}, auth: ${employeeData.id})`;
      } else {
        employeeSearchResult = 'no employees found';
      }
    } catch (error: any) {
      console.error('❌ Employee search failed:', error);
      employeeSearchResult = `failed: ${error.message}`;
    }
    
    return NextResponse.json({
      success: true,
      firebaseAdminInitialized: initStatus,
      firestoreConnectionTest: firestoreStatus,
      deleteTest: deleteTestResult,
      employeeSearch: employeeSearchResult,
      environment: {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY_SET: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0
      }
    });
  } catch (error: any) {
    console.error('Error testing Firebase:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
