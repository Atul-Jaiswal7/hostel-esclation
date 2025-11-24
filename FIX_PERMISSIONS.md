# Fix Firebase Admin SDK Permissions Error

## Error Message
```
Credential implementation provided to initializeApp() via the "credential" property 
has insufficient permission to access the requested resource.
```

## Quick Fix: Grant Required IAM Roles

### Method 1: Using Google Cloud Console (Recommended)

1. **Go to Google Cloud Console IAM**
   - Visit: https://console.cloud.google.com/iam-admin/iam
   - Make sure you're in the **`hostel-b2f9f`** project (check the project selector at the top)

2. **Find Your Service Account**
   - Look for an email like: `firebase-adminsdk-xxxxx@hostel-b2f9f.iam.gserviceaccount.com`
   - This is the service account you're using in your `.env` file

3. **Edit the Service Account**
   - Click the **pencil icon** (✏️) next to the service account
   - Click **"ADD ANOTHER ROLE"** button

4. **Add These Roles** (add them one by one):
   
   **Required Roles:**
   - `Firebase Admin SDK Administrator Service Agent` 
     - Or search for: `roles/firebase.admin`
   - `Service Account Token Creator`
     - Or search for: `roles/iam.serviceAccountTokenCreator`
   - `Firebase Authentication Admin`
     - Or search for: `roles/firebaseauth.admin`
   
   **Optional but Recommended:**
   - `Firebase Realtime Database Admin` (if using Realtime Database)
   - `Cloud Datastore User` (for Firestore access)

5. **Save Changes**
   - Click **"SAVE"** after adding each role
   - Wait a few seconds for permissions to propagate

### Method 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **`hostel-b2f9f`** project
3. Click **⚙️ Project Settings**
4. Go to **Service Accounts** tab
5. The default Firebase Admin SDK service account should already have permissions
6. If you're using a custom service account, you'll need to grant permissions via Google Cloud Console (Method 1)

### Method 3: Using gcloud CLI (Advanced)

If you have `gcloud` CLI installed:

```bash
# Set the project
gcloud config set project hostel-b2f9f

# Get your service account email from .env file
# Then run these commands (replace EMAIL with your service account email):
gcloud projects add-iam-policy-binding hostel-b2f9f \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding hostel-b2f9f \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountTokenCreator"

gcloud projects add-iam-policy-binding hostel-b2f9f \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/firebaseauth.admin"
```

## Verify Permissions

After granting permissions:

1. **Wait 1-2 minutes** for permissions to propagate
2. **Restart your development server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Try adding an employee again**

## Common Issues

### Issue: "Permission denied" even after adding roles
- **Solution**: Wait a few more minutes. IAM permission changes can take up to 5 minutes to propagate.

### Issue: Can't find the service account
- **Solution**: Make sure you're in the correct Google Cloud project (`hostel-b2f9f`). Check the project selector at the top of the page.

### Issue: Service account email doesn't match
- **Solution**: Verify your `FIREBASE_CLIENT_EMAIL` in `.env` matches the service account you're editing. The email should end with `@hostel-b2f9f.iam.gserviceaccount.com`.

## Still Having Issues?

1. **Check your service account email**:
   ```bash
   Get-Content .env | Select-String "FIREBASE_CLIENT_EMAIL"
   ```

2. **Verify project ID matches**:
   ```bash
   Get-Content .env | Select-String "FIREBASE_PROJECT_ID"
   ```
   Should show: `FIREBASE_PROJECT_ID=hostel-b2f9f`

3. **Check Firebase Console**:
   - Go to Firebase Console → Your Project → Project Settings → Service Accounts
   - Verify the service account exists and is active

4. **Try regenerating the service account key**:
   - In Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Update your `.env` file with the new credentials

