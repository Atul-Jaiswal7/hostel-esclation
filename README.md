# MANIT Hostel Escalation System

A comprehensive escalation management system built with Next.js, Firebase, and TypeScript for Maulana Azad National Institute of Technology (MANIT) Hostel.

## Features

### User Management
- **Admin Role**: Users with admin privileges can manage the entire system
- **Hostel Office Role**: New role for hostel office management
- **Regular Employees**: Standard users with department-specific access

### Employee Management
- Add new employees with role-based permissions
- **Admin Checkbox**: When selected, automatically adds user to admin.json and grants admin privileges
- **Hostel Office Checkbox**: When selected, automatically adds user to crm.json and grants Hostel Office privileges
- **Role/Department Fields**: Become non-mandatory when Admin or Hostel Office is selected
- **Firebase Auth Integration**: All users are added to Firebase Authentication

### Escalation Management
- Create and track escalations
- Assign team members
- Update escalation status
- **Hostel Office Notifications**: Automatic email notifications to all Hostel Office users when escalation status is updated

### Email Notifications
- New escalation notifications to Wardens with MANIT branding
- Team member assignment notifications with MANIT branding
- **Status Update Notifications**: Sent to all Hostel Office users when escalation status changes with MANIT branding

## Recent Updates

### Hostel Office Role Implementation
- Added new Hostel Office role similar to Admin
- Removed admin-setup feature (replaced with checkbox-based system)
- Enhanced employee creation form with Admin/Hostel Office checkboxes
- Automatic Hostel Office email notifications for escalation status updates

### Employee Creation Logic
- **If Admin selected**: Adds to admin.json + Firebase Auth
- **If Hostel Office selected**: Adds to crm.json + Firebase Auth  
- **If neither selected**: Only adds to Firebase Auth with role/department

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase configuration:
- Create a Firebase project
- Add your Firebase config to `src/firebase/config.ts`
- Set up Firestore database

3. Configure environment variables:
```bash
cp env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

## File Structure

### Key Files Modified/Added
- `src/lib/crm.json` - Hostel Office user emails
- `src/components/employees/add-employee-form.tsx` - Updated with Admin/Hostel Office checkboxes
- `src/app/api/employees/add/route.ts` - Enhanced employee creation logic
- `src/hooks/useAuth.ts` - Added Hostel Office status checking
- `src/context/escalation-context.tsx` - Added Hostel Office notifications
- `src/app/api/notifications/crm-status-update/route.ts` - New Hostel Office notification API

### Removed Files
- `src/app/(main)/admin-setup/page.tsx` - Admin setup page removed
- `src/app/api/admin/setup/route.ts` - Admin setup API removed

## Usage

### Creating Employees
1. Navigate to Employees page (Admin access required)
2. Fill in employee details
3. Select Admin and/or Hostel Office checkboxes as needed
4. Role and Department fields become optional when Admin/Hostel Office is selected
5. Submit to create the employee

### Escalation Status Updates
- When any user updates an escalation status
- All Hostel Office users automatically receive email notifications
- Notifications include escalation details and status change information

## Technical Details

### Authentication Flow
- Firebase Authentication for user management
- Custom claims for role-based access control
- JSON files (admin.json, crm.json) for role persistence

### Email Notifications
- SendGrid integration for email delivery
- HTML email templates for professional appearance
- Automatic notification routing based on user roles

### Database Schema
- Firestore collections for escalations, employees, and settings
- Real-time updates using Firebase listeners
- Optimized queries for performance

### Branding
- Consistent MANIT branding throughout the application
- MANIT logo used in all UI components and email templates
- Professional email templates with MANIT header and footer
# hostel-esclation
