/**
 * Helper script to extract Firebase Admin SDK credentials from JSON file
 * and format them for .env file
 * 
 * Usage: node scripts/extract-firebase-credentials.js <path-to-service-account-json>
 * 
 * Example: node scripts/extract-firebase-credentials.js ~/Downloads/hostel-b2f9f-firebase-adminsdk-xxxxx.json
 */

const fs = require('fs');
const path = require('path');

// Get the JSON file path from command line arguments
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Error: Please provide the path to your Firebase service account JSON file');
  console.log('\nUsage: node scripts/extract-firebase-credentials.js <path-to-json-file>');
  console.log('Example: node scripts/extract-firebase-credentials.js ~/Downloads/hostel-b2f9f-firebase-adminsdk-xxxxx.json');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ Error: File not found: ${jsonFilePath}`);
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
  const serviceAccount = JSON.parse(jsonContent);

  // Validate it's a service account JSON
  if (serviceAccount.type !== 'service_account') {
    console.error('❌ Error: This does not appear to be a Firebase service account JSON file');
    process.exit(1);
  }

  console.log('✅ Successfully parsed service account JSON\n');
  console.log('📋 Copy these values to your .env file:\n');
  console.log('='.repeat(60));
  console.log('FIREBASE_TYPE=service_account');
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_CLIENT_ID=${serviceAccount.client_id}`);
  console.log(`FIREBASE_AUTH_URI=${serviceAccount.auth_uri}`);
  console.log(`FIREBASE_TOKEN_URI=${serviceAccount.token_uri}`);
  console.log(`FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${serviceAccount.auth_provider_x509_cert_url}`);
  console.log(`FIREBASE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url}`);
  console.log(`FIREBASE_DATABASE_URL=https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`);
  console.log('='.repeat(60));
  
  // Verify project ID
  if (serviceAccount.project_id === 'hostel-b2f9f') {
    console.log('\n✅ Project ID is correct: hostel-b2f9f');
  } else {
    console.log(`\n⚠️  Warning: Project ID is "${serviceAccount.project_id}", expected "hostel-b2f9f"`);
  }

  // Verify client email
  if (serviceAccount.client_email.includes('hostel-b2f9f')) {
    console.log('✅ Client email is from the correct project');
  } else {
    console.log(`⚠️  Warning: Client email "${serviceAccount.client_email}" does not match hostel-b2f9f project`);
  }

  console.log('\n💡 Tip: Copy the values above and paste them into your .env file');
  console.log('   Make sure to replace the existing values, not add duplicates.\n');

} catch (error) {
  console.error('❌ Error reading or parsing JSON file:', error.message);
  process.exit(1);
}

