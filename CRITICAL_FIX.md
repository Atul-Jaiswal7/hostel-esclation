# ⚠️ CRITICAL: Wrong Service Account in .env File

## The Problem

Your `.env` file is using a service account from the **WRONG Firebase project**:

**Current (WRONG):**
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@securestream-bmwf2.iam.gserviceaccount.com
```

**Should be (CORRECT):**
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hostel-b2f9f.iam.gserviceaccount.com
```

Even if you've set up roles correctly, you're using credentials from the old project (`securestream-bmwf2`) instead of the new project (`hostel-b2f9f`).

## The Solution

You **MUST** get new service account credentials from the `hostel-b2f9f` project:

### Step 1: Get New Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Select `hostel-b2f9f` project** (NOT securestream-bmwf2)
3. Click **⚙️ Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** in the confirmation dialog
7. Download the JSON file (it will be named something like `hostel-b2f9f-firebase-adminsdk-xxxxx.json`)

### Step 2: Extract Credentials

**Option A: Use the helper script**
```bash
node scripts/extract-firebase-credentials.js <path-to-downloaded-json>
```

**Option B: Manual extraction**
Open the JSON file and copy these values to your `.env`:
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and `\n`)
- `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
- `client_id` → `FIREBASE_CLIENT_ID`
- `client_x509_cert_url` → `FIREBASE_CLIENT_X509_CERT_URL`

### Step 3: Verify the Email

After updating, check that the email is correct:
```bash
Get-Content .env | Select-String "FIREBASE_CLIENT_EMAIL"
```

It should show:
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hostel-b2f9f.iam.gserviceaccount.com
```

**NOT:**
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@securestream-bmwf2.iam.gserviceaccount.com
```

### Step 4: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## Why This Matters

- The service account email **MUST** match the project ID
- Your project ID is `hostel-b2f9f`
- But your service account is from `securestream-bmwf2`
- Firebase Admin SDK cannot verify tokens from `hostel-b2f9f` using credentials from `securestream-bmwf2`

## Quick Check Command

Run this to see your current configuration:
```powershell
Get-Content .env | Select-String "FIREBASE_CLIENT_EMAIL|FIREBASE_PROJECT_ID|NEXT_PUBLIC_FIREBASE_PROJECT_ID"
```

All three should reference `hostel-b2f9f`, not `securestream-bmwf2`.

