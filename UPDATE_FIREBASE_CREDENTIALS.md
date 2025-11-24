# Update Firebase Admin SDK Credentials

## Problem
Your Firebase Admin SDK service account credentials either:
1. Are from the old project (`securestream-bmwf2`) but your application is using the new project (`hostel-b2f9f`), OR
2. Don't have sufficient permissions to verify tokens and manage users

**Current Error**: "Credential implementation provided to initializeApp() via the 'credential' property has insufficient permission to access the requested resource."

This means the service account needs proper IAM roles assigned.

## Solution: Get New Service Account Credentials

### Step 1: Get Service Account Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Select your `hostel-b2f9f` project** (not the old one)
3. Click the **gear icon** ⚙️ next to "Project Overview"
4. Click **"Project settings"**
5. Go to the **"Service accounts"** tab
6. Click **"Generate new private key"**
7. Click **"Generate key"** in the confirmation dialog
8. A JSON file will be downloaded (e.g., `hostel-b2f9f-firebase-adminsdk-xxxxx.json`)

### Step 2: Extract Values from JSON

**Option A: Use the Helper Script (Recommended)**

1. After downloading the JSON file, run:
   ```bash
   node scripts/extract-firebase-credentials.js <path-to-your-json-file>
   ```
   
   Example:
   ```bash
   node scripts/extract-firebase-credentials.js ~/Downloads/hostel-b2f9f-firebase-adminsdk-xxxxx.json
   ```
   
   This will output all the values formatted correctly for your `.env` file.

**Option B: Manual Extraction**

Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "hostel-b2f9f",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@hostel-b2f9f.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40hostel-b2f9f.iam.gserviceaccount.com"
}
```

### Step 3: Update Your .env File

Update these variables in your `.env` file with values from the JSON:

```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=hostel-b2f9f
FIREBASE_PRIVATE_KEY_ID=<value from "private_key_id" in JSON>
FIREBASE_PRIVATE_KEY="<value from "private_key" in JSON - keep the quotes and \n characters>"
FIREBASE_CLIENT_EMAIL=<value from "client_email" in JSON>
FIREBASE_CLIENT_ID=<value from "client_id" in JSON>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=<value from "client_x509_cert_url" in JSON>
FIREBASE_DATABASE_URL=https://hostel-b2f9f-default-rtdb.firebaseio.com
```

### Important Notes:

1. **FIREBASE_PRIVATE_KEY**: 
   - Must be wrapped in double quotes `"`
   - Keep all `\n` characters as they are (don't convert to actual newlines)
   - Example: `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

2. **FIREBASE_CLIENT_EMAIL**: 
   - Should end with `@hostel-b2f9f.iam.gserviceaccount.com`
   - NOT `@securestream-bmwf2.iam.gserviceaccount.com`

3. **FIREBASE_PROJECT_ID**: 
   - Should be `hostel-b2f9f` (already correct)

### Step 4: Grant Required Permissions to Service Account

**IMPORTANT**: The service account needs proper IAM roles to verify tokens and manage users.

1. Go to [Google Cloud Console IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. **Select your `hostel-b2f9f` project** (make sure it's the correct project)
3. Find your service account (it should be named something like `firebase-adminsdk-xxxxx@hostel-b2f9f.iam.gserviceaccount.com`)
4. Click the **pencil icon** (Edit) next to the service account
5. Click **"Add Another Role"**
6. Add these roles (one at a time):
   - **Firebase Admin SDK Administrator Service Agent** (or `roles/firebase.admin`)
   - **Service Account Token Creator** (or `roles/iam.serviceAccountTokenCreator`)
   - **Firebase Authentication Admin** (or `roles/firebaseauth.admin`)
7. Click **"Save"** after adding each role

**Alternative: Use Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `hostel-b2f9f` project
3. Go to **Project Settings** → **Service Accounts** tab
4. The default service account should already have most permissions, but if you're using a custom service account, you'll need to grant permissions in Google Cloud Console (steps above)

### Step 5: Restart Your Development Server

After updating the `.env` file and granting permissions:
1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 6: Verify It Works

Try adding an employee again. The error should be resolved.

## Quick Check

After updating, verify your credentials are correct:

```bash
# Check that CLIENT_EMAIL is from the correct project
Get-Content .env | Select-String "FIREBASE_CLIENT_EMAIL"
```

It should show: `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hostel-b2f9f.iam.gserviceaccount.com`

NOT: `firebase-adminsdk-xxxxx@securestream-bmwf2.iam.gserviceaccount.com`

