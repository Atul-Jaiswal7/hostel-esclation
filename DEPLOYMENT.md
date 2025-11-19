# Vercel Deployment Guide

This guide will walk you through deploying your Escalation Tracker System to Vercel.

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Firebase Project** - Set up Firebase project and get credentials
4. **SendGrid Account** - For email notifications
5. **Google AI API Key** - For AI-powered suggestions

## Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Ensure these files are in your repository:**
   - `vercel.json` ✅
   - `next.config.ts` ✅
   - `package.json` ✅
   - `src/` directory ✅

## Step 2: Set Up Firebase

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "escalation-tracker")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2.2 Enable Services

1. **Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (you can secure it later)
   - Select a location close to your users

2. **Authentication**
   - Click "Authentication" in the left sidebar
   - Click "Get started"
   - Enable "Email/Password" sign-in method
   - Click "Save"

3. **Web App**
   - Click the gear icon next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register app with a nickname
   - Copy the config object

### 2.3 Service Account

1. In Project Settings, go to "Service accounts" tab
2. Click "Generate new private key"
3. Download the JSON file
4. **Keep this file secure** - it contains sensitive information

## Step 3: Set Up SendGrid

### 3.1 Create Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account
3. Verify your email address

### 3.2 Verify Sender

1. Go to "Settings" > "Sender Authentication"
2. Click "Verify a Single Sender"
3. Fill in your details and verify your email

### 3.3 API Key

1. Go to "Settings" > "API Keys"
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access" with "Mail Send" permissions
4. Copy the API key

## Step 4: Get Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key"
4. Create a new API key
5. Copy the key

## Step 5: Deploy to Vercel

### 5.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Click "Import"

### 5.2 Configure Project

1. **Framework Preset**: Should auto-detect as Next.js
2. **Root Directory**: Leave as `./` (root of your repository)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`

### 5.3 Environment Variables

**IMPORTANT**: Add these environment variables in Vercel before deploying:

#### Firebase (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Firebase Admin (Private)
```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email
FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
```

#### SendGrid
```
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
```

#### Google AI
```
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

**To add environment variables in Vercel:**

1. In your project settings, go to "Environment Variables"
2. Click "Add New"
3. Add each variable with the appropriate scope:
   - **Production**: For live site
   - **Preview**: For pull request deployments
   - **Development**: For local development

### 5.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Step 6: Post-Deployment

### 6.1 Test Your App

1. Visit your deployed URL
2. Test the main functionality:
   - User authentication
   - Creating escalations
   - AI department suggestions
   - Email notifications

### 6.2 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### 6.3 Monitor Performance

1. Check Vercel Analytics
2. Monitor function execution times
3. Check for any errors in the Vercel dashboard

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally
   - Check Vercel build logs for specific errors

2. **Environment Variables**
   - Verify all required variables are set in Vercel
   - Check that variable names match exactly
   - Ensure private keys are properly formatted

3. **Firebase Connection Issues**
   - Verify Firebase project ID matches
   - Check that service account has proper permissions
   - Ensure Firestore rules allow read/write

4. **API Route Errors**
   - Check Vercel function logs
   - Verify API routes are properly structured
   - Check CORS settings if calling from external domains

### Debugging

1. **Vercel Function Logs**
   - Go to your project dashboard
   - Click on "Functions" tab
   - Check execution logs for errors

2. **Local Testing**
   - Test API routes locally with `npm run dev`
   - Use tools like Postman to test endpoints
   - Check browser console for client-side errors

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to Git
   - Use Vercel's environment variable encryption
   - Rotate API keys regularly

2. **Firebase Rules**
   - Implement proper Firestore security rules
   - Restrict access based on user authentication
   - Use Firebase Auth for user management

3. **API Security**
   - Implement rate limiting if needed
   - Validate all input data
   - Use HTTPS for all communications

## Cost Optimization

1. **Vercel**
   - Free tier includes 100GB bandwidth/month
   - Serverless functions: 100GB-hours/month
   - Upgrade to Pro for more resources

2. **Firebase**
   - Free tier includes 1GB storage and 50K reads/day
   - Monitor usage in Firebase console
   - Set up billing alerts

3. **SendGrid**
   - Free tier: 100 emails/day
   - Monitor email usage
   - Upgrade plan as needed

## Next Steps

1. **Set up monitoring** with Vercel Analytics
2. **Configure CI/CD** for automatic deployments
3. **Set up staging environment** for testing
4. **Implement backup strategies** for your data
5. **Add performance monitoring** and error tracking

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
