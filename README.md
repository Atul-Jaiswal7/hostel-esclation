# Hostel Escalation System

A comprehensive, real-time escalation management system built for hostel administration to efficiently track, assign, and resolve student issues across multiple departments and hostels.

---

## 📋 Project Overview

### What the System Does

The Hostel Escalation System is a full-stack web application designed to streamline the process of handling student complaints and issues in a hostel environment. It provides a centralized platform where students can report problems, administrators can track escalations in real-time, and employees can manage and resolve issues efficiently.

### The Problem It Solves

In traditional hostel management systems, student complaints are often handled through:
- Physical complaint books
- Email chains that get lost
- Phone calls with no tracking
- Manual assignment processes

This leads to:
- **Lost or forgotten escalations**
- **No accountability or tracking**
- **Delayed response times**
- **Poor visibility into issue resolution**
- **Difficulty in analyzing patterns**

Our system solves these problems by providing:
- **Centralized tracking** of all escalations
- **Automated assignment** to appropriate departments
- **Real-time status updates** for all stakeholders
- **Complete audit trail** with history and comments
- **Analytics dashboard** for data-driven decisions
- **Email notifications** to keep everyone informed

### Who the Users Are

1. **Admin**
   - Full system access
   - Manages employees, departments, and settings
   - Views all escalations across all hostels
   - Can create, update, and delete any escalation
   - Access to comprehensive analytics

2. **Hostel Office**
   - Manages escalations for their assigned hostel only
   - Receives notifications when escalation status changes
   - Can view and track escalations within their hostel
   - Limited to their specific hostel's data

3. **Supervisor (Department Head)**
   - Receives automatic assignments for their department
   - Manages escalations assigned to their department
   - Can assign team members to handle specific issues
   - Updates escalation status and adds comments

4. **Team Member (Employee)**
   - Assigned to specific escalations by supervisors
   - Updates status and adds progress comments
   - Receives email notifications when assigned

5. **Student**
   - Creates new escalations through the system
   - Can view status of their submitted issues
   - Receives updates on their escalations

### Why the System is Useful

In a real hostel environment with hundreds or thousands of students, managing complaints efficiently is critical. This system:

- **Reduces response time** by automating assignment to the right department
- **Improves accountability** with complete tracking and history
- **Enables data-driven decisions** through analytics and reporting
- **Scales easily** as the hostel grows
- **Provides transparency** to students about their issue status
- **Eliminates manual errors** through automated workflows

---

## ✨ Key Features

### 1. Role-Based Access Control (RBAC)

The system implements granular role-based permissions:

- **Admin**: Full system access, can manage everything
- **Hostel Office**: Scoped to their assigned hostel only
- **Supervisor**: Department-specific access
- **Team Member**: Assigned escalation access only
- **Student**: Can create and view their own escalations

Access is enforced at both the UI level (conditional rendering) and API level (server-side validation using Firebase custom claims and Firestore queries).

### 2. Escalation Creation & Tracking

- **Student Information**: Name, email, hostel, room number
- **Issue Description**: Detailed problem description with AI-powered department suggestion
- **Automatic Assignment**: Based on department selection, automatically assigns to the department's Supervisor
- **Status Tracking**: Multiple statuses (New, In Progress, Resolved, Closed, etc.)
- **Complete History**: Every status change and comment is logged with timestamp and author
- **Real-time Updates**: Changes reflect immediately across all connected clients

### 3. Auto + Manual Assignment

**Automatic Assignment:**
- When a student creates an escalation and selects a department, the system automatically:
  1. Finds the Supervisor assigned to that department
  2. Assigns the escalation to them
  3. Sends an email notification to the Supervisor
  4. Adds the Supervisor to the `involvedUsers` array

**Manual Assignment:**
- Supervisors can manually assign specific escalations to team members
- Team members receive email notifications when assigned
- Assignment history is tracked in the escalation's comment history

### 4. Real-Time Status Updates

- Uses Firebase Firestore's `onSnapshot` listeners for real-time data synchronization
- Changes made by one user are instantly visible to all other users
- No page refresh required
- Optimistic UI updates for better user experience

### 5. Employee Management Module

- **Add Employees**: Admins can create new employee accounts
- **Role Assignment**: Assign roles (Admin, Supervisor, Team Member, Hostel Office)
- **Department Assignment**: Link employees to specific departments
- **Hostel Assignment**: For Hostel Office role, assign to specific hostel
- **Status Management**: Enable/disable employee accounts
- **Edit Employee Details**: Update employee information
- **Firebase Authentication Integration**: All employees are created in Firebase Auth with custom claims

### 6. Dashboard Analytics

**Statistics Cards:**
- Total Escalations
- In Progress count
- Resolved count
- Average Resolution Time

**Interactive Charts:**
- **Escalations by Initial Department**: Bar chart showing distribution across departments
- **Escalations by Status**: Bar chart showing status breakdown
- **Escalations by Hostel**: Bar chart showing distribution across hostels

All charts are:
- Responsive (mobile-friendly)
- Interactive with tooltips
- Real-time (update automatically)
- Sorted by count for easy identification of hotspots

### 7. Filtering, Sorting & Pagination

**Data Table Features:**
- **Column Filtering**: Filter by status, department, hostel, etc.
- **Global Search**: Search across all columns
- **Column Sorting**: Click column headers to sort
- **Pagination**: Configurable page size (default: 5 per page)
- **View Options**: Toggle column visibility
- **Faceted Filters**: Quick filter chips for common filters

### 8. Email Notifications

**Notification Types:**
1. **New Escalation Notification**: Sent to Supervisor when a new escalation is assigned to their department
2. **Team Member Assignment**: Sent to team member when assigned to an escalation
3. **Status Update Notification**: Sent to all Hostel Office employees when escalation status changes

**Features:**
- HTML email templates with MANIT branding
- Professional design with clear call-to-actions
- Includes escalation details, student information, and links
- Powered by SendGrid API

### 9. Login + Authentication

- **Firebase Authentication**: Secure, industry-standard authentication
- **Email/Password**: Standard login method
- **Password Reset**: Built-in password reset flow
- **Custom Claims**: Role-based permissions stored in JWT tokens
- **Session Management**: Automatic token refresh
- **Anonymous Access**: Limited anonymous access for viewing (if needed)

### 10. AI-Powered Department Suggestion

- Uses Google Gemini AI to analyze escalation descriptions
- Suggests the most appropriate department automatically
- Reduces errors in manual department selection
- Validates suggestions against configured departments
- Optional feature - users can still select manually

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15.3.3**: React framework with App Router
- **TypeScript 5**: Type-safe development
- **React 18.3.1**: UI library
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library built on Radix UI
- **Recharts 2.15.1**: Charting library for analytics
- **React Hook Form 7.54.2**: Form management
- **Zod 3.24.2**: Schema validation
- **TanStack Table 8.19.3**: Powerful data table component

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Firebase Admin SDK 12.2.0**: Server-side Firebase operations
- **Firebase 11.10.0**: Client-side Firebase SDK

### Database & Services
- **Firestore**: NoSQL database for real-time data
- **Firebase Authentication**: User authentication service
- **SendGrid**: Email delivery service
- **Google Gemini AI**: AI-powered department suggestion

### Deployment
- **Vercel**: Hosting platform (optimized for Next.js)
- **Firebase Hosting**: Alternative hosting option

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing

---

## 🚀 Why I Used Next.js

### 1. Server-Side Rendering (SSR)

Next.js provides built-in SSR capabilities that offer:
- **Better SEO**: Pages are pre-rendered on the server
- **Faster Initial Load**: HTML is sent immediately, improving perceived performance
- **Social Media Sharing**: Proper meta tags and Open Graph support

### 2. File-Based Routing

Next.js App Router provides:
- **Intuitive Structure**: File structure directly maps to routes
- **Nested Routes**: Easy organization with layout files
- **Dynamic Routes**: `[id]` syntax for dynamic pages
- **Route Groups**: Organize routes without affecting URL structure

### 3. API Routes

Next.js API routes allow:
- **Full-Stack in One Project**: No need for separate backend
- **Serverless Functions**: Automatic scaling on Vercel
- **Middleware Support**: Easy authentication and request handling
- **Type Safety**: Shared TypeScript types between frontend and backend

### 4. Optimization Features

- **Image Optimization**: Automatic image optimization and lazy loading
- **Code Splitting**: Automatic code splitting for optimal bundle sizes
- **Static Generation**: Pre-render pages at build time when possible
- **Incremental Static Regeneration**: Update static pages without full rebuild

### 5. Developer Experience

- **Hot Module Replacement**: Instant updates during development
- **TypeScript Support**: First-class TypeScript support
- **Built-in CSS Support**: CSS Modules, Tailwind, and more
- **Excellent Documentation**: Comprehensive docs and examples

---

## 🔥 Why I Used Firebase

### 1. Fast Development

Firebase provides:
- **Pre-built Services**: Authentication, database, storage out of the box
- **No Backend Setup**: No need to set up servers, databases, or APIs
- **Rapid Prototyping**: Get a working app in hours, not days
- **Less Code**: Firebase handles complex operations like real-time sync

### 2. Built-in Authentication

Firebase Authentication offers:
- **Multiple Providers**: Email/password, Google, Facebook, etc.
- **Secure by Default**: Industry-standard security practices
- **Custom Claims**: Role-based access control built-in
- **Token Management**: Automatic token refresh and validation
- **User Management**: Easy user creation, deletion, and updates

### 3. Real-Time Database

Firestore provides:
- **Real-Time Listeners**: `onSnapshot` for instant updates
- **Offline Support**: Works offline and syncs when online
- **Automatic Scaling**: Handles traffic spikes automatically
- **NoSQL Flexibility**: Easy schema changes without migrations

### 4. Role-Based Security Rules

Firestore Security Rules enable:
- **Client-Side Security**: Rules enforced at database level
- **Granular Permissions**: Field-level access control
- **User-Based Queries**: Users can only query their own data
- **Custom Claims Integration**: Use Firebase Auth claims in rules

### 5. Scalability

- **Automatic Scaling**: Handles millions of users without configuration
- **Global CDN**: Fast access from anywhere in the world
- **Pay-as-You-Go**: Cost-effective for growing applications
- **No Server Management**: Google handles infrastructure

### 6. Zero Backend Maintenance

- **No Servers to Manage**: Fully managed service
- **Automatic Updates**: Security and feature updates handled by Google
- **Monitoring Built-in**: Firebase Console provides insights
- **Backup & Recovery**: Automatic backups and point-in-time recovery

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │ Escalations  │  │  Employees   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                   │
│                    ┌──────▼───────┐                           │
│                    │  Next.js App  │                           │
│                    │  (Frontend)   │                           │
│                    └──────┬───────┘                           │
└───────────────────────────┼───────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
         ┌──────▼─────┐ ┌───▼────┐ ┌───▼──────┐
         │  Next.js    │ │Firebase│ │ SendGrid │
         │  API Routes │ │Auth +  │ │   API    │
         │  (Backend)  │ │Firestore│ │          │
         └──────┬──────┘ └────────┘ └──────────┘
                │
         ┌──────▼──────┐
         │  Firebase   │
         │  Admin SDK  │
         └─────────────┘
```

### Data Flow

**1. Escalation Creation Flow:**
```
Student → New Escalation Form → Next.js API Route → Firebase Admin SDK
                                                          │
                                                          ├─→ Firestore (Save Escalation)
                                                          │
                                                          └─→ Firebase Auth (Get Supervisor)
                                                          │
                                                          └─→ SendGrid (Email Notification)
                                                          │
                                                          └─→ Real-time Update (onSnapshot)
```

**2. Real-Time Update Flow:**
```
User Action → Firestore Update → onSnapshot Listener → UI Update (All Clients)
```

**3. Authentication Flow:**
```
User Login → Firebase Auth → ID Token → Next.js API → Verify Token → Check Custom Claims → Grant Access
```

**4. Role-Based Filtering:**
```
Hostel Office User → useAuth Hook → Get Hostel → Escalation Context → Firestore Query (where hostelName == user.hostel)
```

---

## 💾 Database Structure

### Collections

#### 1. `escalations`

```typescript
{
  id: string;                    // Document ID
  studentName: string;
  studentEmail: string;
  hostelName: string;
  roomNumber: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  department: string;            // e.g., "Maintenance", "Mess"
  description: string;
  status: string;                 // e.g., "New", "In Progress", "Resolved"
  assignedTo: string;            // Supervisor name
  hodEmail: string;              // Supervisor email
  assignedTeamMemberEmail: string | null;
  history: CommentFirestore[];   // Array of comments/status updates
  involvedUsers: string[];       // Array of email addresses
  createdBy: string;             // Email of creator
}
```

**Indexes Required:**
- `hostelName` (ascending) + `startDate` (descending) - For Hostel Office filtering
- `department` (ascending) + `startDate` (descending) - For department filtering
- `status` (ascending) + `startDate` (descending) - For status filtering

#### 2. `employees`

```typescript
{
  id: string;                    // Firebase Auth UID
  name: string;
  email: string;
  role: string;                  // "Admin", "Supervisor", "Team Member", "Hostel Office"
  department: string | null;     // Required for Supervisor/Team Member
  hostel: string | null;         // Required for Hostel Office
  isAdmin: boolean;
  createdAt: Timestamp;
  isActive: boolean;
}
```

#### 3. `settings`

```typescript
{
  id: "system";                  // Single document
  departments: string[];         // ["Maintenance", "Mess", "Water", ...]
  roles: string[];               // ["Admin", "Supervisor", "Team Member", ...]
  statuses: string[];            // ["New", "In Progress", "Resolved", ...]
  hostels: string[];             // ["Hostel A", "Hostel B", ...]
}
```

### Role-Based Access Through Firestore Rules

Currently, the system uses a temporary rule that allows all authenticated users to read/write. In production, you would implement rules like:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Escalations collection
    match /escalations/{escalationId} {
      // Admins can read/write all
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.isAdmin == true;
      
      // Hostel Office can read/write their hostel's escalations
      allow read, write: if request.auth != null && 
        resource.data.hostelName == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.hostel;
      
      // Supervisors can read/write their department's escalations
      allow read, write: if request.auth != null && 
        resource.data.department == get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.department;
      
      // Users can read escalations they're involved in
      allow read: if request.auth != null && 
        request.auth.token.email in resource.data.involvedUsers;
    }
    
    // Employees collection
    match /employees/{employeeId} {
      // Admins can read/write all
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.isAdmin == true;
      
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == employeeId;
    }
  }
}
```

**Note:** The current implementation enforces access control at the application level (Next.js API routes) rather than Firestore rules, which provides more flexibility and easier debugging.

---

## 🔄 How Assignment Works

### Department Selection

1. **Student creates escalation** and enters issue description
2. **AI Suggestion (Optional)**: 
   - System analyzes description using Google Gemini AI
   - Suggests appropriate department
   - User can accept or manually select
3. **Manual Selection**: User selects department from dropdown (populated from settings)

### Auto Assignment Logic

When an escalation is created:

```typescript
1. User selects department (e.g., "Maintenance")
2. System queries employees collection:
   - Filter: role === "Supervisor" AND department === "Maintenance"
3. If Supervisor found:
   - Set assignedTo = Supervisor.name
   - Set hodEmail = Supervisor.email
   - Add Supervisor.email to involvedUsers array
   - Send email notification to Supervisor
4. If no Supervisor found:
   - Show error to user
   - Prevent escalation creation
```

### Manual Assignment Input

Supervisors can manually assign escalations to team members:

1. **Supervisor views escalation** in the escalations list
2. **Clicks "Assign Team Member"** button
3. **Selects team member** from dropdown (filtered by department)
4. **System updates escalation**:
   - Sets `assignedTeamMemberEmail`
   - Adds comment to history
   - Adds team member to `involvedUsers`
   - Sends email notification to team member

### Employee Notification

**Email Notification Flow:**

1. **New Escalation → Supervisor:**
   - Triggered when escalation is created
   - Contains: Escalation ID, student details, department, description
   - Includes link to view escalation

2. **Team Member Assignment:**
   - Triggered when Supervisor assigns team member
   - Contains: Escalation ID, student details, supervisor name, description
   - Includes link to view escalation

3. **Status Update → Hostel Office:**
   - Triggered when escalation status changes
   - Sent to all Hostel Office employees
   - Contains: Escalation ID, old status, new status, student details

All emails are sent via SendGrid API with HTML templates and MANIT branding.

---

## 📱 Screens / Modules

### 1. Dashboard (`/dashboard`)

**Purpose:** Overview of system metrics and analytics

**Features:**
- **Stats Cards**: Total escalations, in progress, resolved, average resolution time
- **Charts**: 
  - Escalations by Initial Department (bar chart)
  - Escalations by Status (bar chart)
  - Escalations by Hostel (bar chart)
- **Real-time Updates**: All metrics update automatically
- **Responsive Design**: Works on mobile and desktop

**Access Control:**
- Admins: See all escalations
- Hostel Office: See only their hostel's escalations
- Others: See escalations they're involved in

### 2. Escalation List (`/escalations`)

**Purpose:** View and manage all escalations

**Features:**
- **Data Table** with:
  - Column filtering
  - Global search
  - Sorting
  - Pagination
  - Row actions (View Details, Update Status, Assign Team Member)
- **Filters**: Status, Department, Hostel, Date range
- **View Options**: Toggle column visibility
- **Export**: (Future feature)

**Access Control:**
- Admins: All escalations
- Hostel Office: Only their hostel
- Supervisors: Their department's escalations
- Team Members: Assigned escalations only

### 3. Create Escalation (`/escalations/new`)

**Purpose:** Students/employees create new escalations

**Form Fields:**
- Student Name (required)
- Student Email (required, validated)
- Hostel Name (required)
- Room Number (required)
- Description (required, min 10 chars, max 500 chars)
- Department (required, with AI suggestion)
- Team Member Email (optional, for direct assignment)

**Features:**
- **AI Department Suggestion**: Click "Suggest Department" button
- **Form Validation**: Real-time validation with error messages
- **Auto-assignment**: Automatically assigns to department Supervisor
- **Success Notification**: Toast notification on successful creation

### 4. Employee Management (`/employees`)

**Purpose:** Admin manages system employees

**Features:**
- **Add Employee Form**:
  - Full Name
  - Email
  - Role (dropdown: Admin, Supervisor, Team Member, Hostel Office)
  - Department (conditional: required for Supervisor/Team Member)
  - Hostel (conditional: required for Hostel Office)
  - Is Admin (checkbox)
- **Employee List Table**:
  - View all employees
  - Edit employee details
  - Enable/disable accounts
  - Delete employees (with confirmation)
- **Bulk Actions**: (Future feature)

**Access Control:**
- Admin only

### 5. Settings (`/settings`)

**Purpose:** Configure system-wide settings

**Features:**
- **Departments Management**:
  - Add new departments
  - Edit existing departments
  - Delete departments
- **Roles Management**:
  - Add new roles
  - Edit existing roles
  - Delete roles
- **Statuses Management**:
  - Add new statuses
  - Edit existing statuses
  - Delete statuses
- **Hostels Management**:
  - Add new hostels
  - Edit existing hostels
  - Delete hostels
- **Database Seeding**: One-click seed with mock data (Admin only)

**Access Control:**
- Admin only

### 6. Authentication Page (`/`)

**Purpose:** User login

**Features:**
- Email/password login
- Password reset link
- Error handling for invalid credentials
- Redirects to dashboard on success

---

## 🎯 Challenges Faced & Solutions

### 1. Role-Based Access Control

**Challenge:** Implementing granular permissions for different user roles while maintaining security.

**Solution:**
- Used Firebase Custom Claims to store role information in JWT tokens
- Implemented dual-layer security: UI-level (conditional rendering) and API-level (server-side validation)
- Created `useAuth` hook to centralize authentication state
- Used Firestore queries with `where` clauses to filter data at database level
- For Hostel Office, implemented query filtering: `where("hostelName", "==", user.hostel)`

### 2. Database Structuring

**Challenge:** Designing a flexible schema that supports multiple roles, departments, and hostels while maintaining data integrity.

**Solution:**
- Used NoSQL structure with denormalized data for performance
- Stored `involvedUsers` array to track all stakeholders
- Created `history` array for complete audit trail
- Used composite indexes for complex queries (hostelName + startDate)
- Implemented settings collection for dynamic configuration

### 3. Real-Time Updates

**Challenge:** Ensuring all users see updates immediately without polling or manual refresh.

**Solution:**
- Used Firestore's `onSnapshot` listeners for real-time synchronization
- Implemented React Context API (`EscalationContext`) to share state across components
- Added loading states and error handling for connection issues
- Optimized re-renders with React.memo and useMemo where needed

### 4. UI Complexity

**Challenge:** Building a responsive, accessible, and user-friendly interface with complex data tables and forms.

**Solution:**
- Used shadcn/ui component library for consistent, accessible components
- Implemented TanStack Table for powerful data table features
- Created reusable components (StatsCards, EscalationCharts, etc.)
- Used Tailwind CSS for responsive design
- Added loading skeletons for better UX
- Implemented form validation with Zod and React Hook Form

### 5. Deployment Issues

**Challenge:** Configuring Firebase credentials, environment variables, and Vercel deployment.

**Solution:**
- Created detailed documentation (FIX_PERMISSIONS.md, UPDATE_FIREBASE_CREDENTIALS.md)
- Used environment variables for sensitive data
- Configured Vercel environment variables
- Set up Firebase service account with proper IAM roles
- Implemented error handling for missing credentials
- Added connection testing endpoints

### 6. Email Notifications

**Challenge:** Sending professional, branded emails reliably.

**Solution:**
- Integrated SendGrid API for reliable email delivery
- Created HTML email templates with MANIT branding
- Implemented error handling and retry logic
- Used Next.js API routes for server-side email sending
- Added email type tracking for analytics

### 7. AI Integration

**Challenge:** Integrating AI for department suggestion while handling errors gracefully.

**Solution:**
- Used Google Gemini AI API
- Implemented fallback to manual selection if AI fails
- Added validation to ensure AI suggestions match configured departments
- Made AI suggestion optional (user can still select manually)
- Added loading states and error messages

---

## 🚀 Scalability & Future Improvements

### Short-Term Improvements

1. **Enhanced Analytics**
   - Hostel-level performance metrics
   - Department-wise resolution time analysis
   - Trend analysis (escalations over time)
   - Predictive analytics for peak times

2. **SMS Notifications**
   - Integrate Twilio or similar service
   - Send SMS for critical escalations
   - SMS reminders for pending issues

3. **Mobile App**
   - React Native app for students
   - Push notifications
   - Offline support

4. **Advanced Filtering**
   - Date range filters
   - Multi-select filters
   - Saved filter presets
   - Export to CSV/PDF

### Long-Term Improvements

1. **AI-Based Auto-Routing**
   - Machine learning model to predict best department
   - Auto-assignment based on historical data
   - Priority scoring for escalations
   - Smart workload balancing

2. **Attendance/Shift Management**
   - Track employee availability
   - Shift-based assignment
   - Workload balancing
   - Performance metrics per employee

3. **Integration with Other Systems**
   - Student information system (SIS) integration
   - Maintenance management system
   - Billing system for chargeable repairs
   - Inventory management for supplies

4. **Advanced Reporting**
   - Custom report builder
   - Scheduled reports (daily/weekly/monthly)
   - Email reports to administrators
   - Data visualization dashboards

5. **Multi-Tenant Support**
   - Support multiple institutions
   - Institution-specific branding
   - Isolated data per institution
   - Super admin role

6. **Chat/Messaging System**
   - Real-time chat between stakeholders
   - File attachments
   - Voice messages
   - Video calls for complex issues

7. **Workflow Automation**
   - Custom workflows per department
   - Approval chains
   - Escalation rules (auto-escalate if not resolved in X days)
   - SLA tracking and alerts

---

## 🏃 How to Run the Project

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager
- Firebase account
- SendGrid account (for email notifications)
- Google Cloud account (for Gemini AI - optional)

### Setup Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Escalation-tracker-main
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Firebase Configuration

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Firebase Authentication (Email/Password)

2. **Get Firebase Config:**
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click Web icon (`</>`)
   - Copy the Firebase configuration object

3. **Create Service Account:**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

4. **Set Firestore Indexes:**
   - Go to Firestore → Indexes
   - Create composite indexes:
     - Collection: `escalations`
     - Fields: `hostelName` (Ascending), `startDate` (Descending)
     - Fields: `department` (Ascending), `startDate` (Descending)
     - Fields: `status` (Ascending), `startDate` (Descending)

#### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# SendGrid (for email notifications)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Google Gemini AI (optional, for department suggestion)
GEMINI_API_KEY=your-gemini-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Keep `.env.local` in `.gitignore` (never commit it)
- For production, set these in Vercel environment variables

#### 5. Firebase Service Account Permissions

Grant the following IAM roles to your service account in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to IAM & Admin → IAM
4. Find your service account (`firebase-adminsdk-xxxxx@...`)
5. Add these roles:
   - **Firebase Admin SDK Administrator Service Agent**
   - **Service Account Token Creator**
   - **Firebase Authentication Admin**

#### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

#### 7. Create First Admin User

1. Open the application in your browser
2. Sign up with your email (this will create a Firebase Auth user)
3. Manually add yourself to Firestore:
   - Go to Firestore Console
   - Create document in `employees` collection
   - Document ID: Your Firebase Auth UID
   - Set `isAdmin: true` and `role: "Admin"`

Alternatively, use the Firebase Console to set custom claims:
- Go to Authentication → Users
- Click on your user
- Click "Add custom claim"
- Add `isAdmin: true`

### Deploy to Vercel

#### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Add all environment variables from `.env.local`
4. Deploy

#### 3. Configure Firebase for Production

1. Add your Vercel domain to Firebase Authorized Domains:
   - Firebase Console → Authentication → Settings → Authorized Domains
   - Add your Vercel domain

2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL

### Troubleshooting

**Issue: "Invalid authentication token"**
- Solution: Check that `FIREBASE_PROJECT_ID` matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Verify service account credentials are correct
- Ensure service account has proper IAM roles

**Issue: "Firestore permission denied"**
- Solution: Check Firestore security rules
- Verify user is authenticated
- Check custom claims are set correctly

**Issue: "Email not sending"**
- Solution: Verify SendGrid API key is correct
- Check SendGrid account is verified
- Verify `SENDGRID_FROM_EMAIL` is a verified sender

**Issue: "AI suggestion not working"**
- Solution: Check `GEMINI_API_KEY` is set
- Verify API key is valid
- Check API quota limits

---

## 📝 Additional Notes

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main layout group
│   │   ├── dashboard/     # Dashboard page
│   │   ├── escalations/   # Escalation pages
│   │   ├── employees/     # Employee management
│   │   └── settings/      # Settings page
│   ├── api/               # API routes
│   └── page.tsx           # Landing/auth page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── employees/         # Employee components
│   ├── escalations/       # Escalation components
│   ├── reports/           # Analytics components
│   └── ui/                # shadcn/ui components
├── context/               # React Context providers
├── firebase/              # Firebase configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

### Key Files

- `src/hooks/useAuth.ts`: Authentication and role management
- `src/context/escalation-context.tsx`: Escalation state management
- `src/app/api/employees/add/route.ts`: Employee creation API
- `src/components/escalations/new-escalation-form.tsx`: Escalation creation form
- `src/firebase/admin.ts`: Firebase Admin SDK initialization
- `src/firebase/config.ts`: Firebase client configuration

---

## 📄 License

This project is proprietary software developed for MANIT Hostel management.

---

## 👤 Author

Developed as a comprehensive escalation management solution for hostel administration.

---

**Built with ❤️ using Next.js, Firebase, and TypeScript**
