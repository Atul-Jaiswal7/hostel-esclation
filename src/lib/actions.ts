// actions.ts - Client-side functions for API calls

export async function getDepartmentSuggestion(description: string) {
    try {
        const response = await fetch('/api/ai/suggest-department', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', response.status, errorData);
            throw new Error(`Failed to get department suggestion: ${errorData.error || 'Unknown error'}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error in getDepartmentSuggestion:", error);
        return { department: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

interface NewEscalationNotificationProps {
    hodEmail: string;
    escalationId: string;
    studentName: string;
    department: string;
}

export async function sendNewEscalationNotification(props: NewEscalationNotificationProps) {
    const { hodEmail, escalationId, studentName, department } = props;
    
    try {
        const subject = `New Escalation Assigned: #${escalationId}`;
        
        // Enhanced HTML email template with MANIT branding
        const body = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
                    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
                    .escalation-id { color: #dc3545; font-weight: bold; }
                    .department { color: #007bff; font-weight: bold; }
                    .student-name { color: #28a745; font-weight: bold; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="color: #30475E;">MANIT Hostel Escalation System</h2>
                        <h2>🔔 New Escalation Assignment</h2>
                    </div>
                    
                    <p>Dear Supervisor,</p>
                    
                    <p>A new escalation has been assigned to your department and requires your attention.</p>
                    
                    <h3>📋 Escalation Details:</h3>
                    <ul>
                        <li><strong>Escalation ID:</strong> <span class="escalation-id">#${escalationId}</span></li>
                        <li><strong>Department:</strong> <span class="department">${department}</span></li>
                        <li><strong>Student:</strong> <span class="student-name">${studentName}</span></li>
                        <li><strong>Assigned:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    
                    <p>Please review this escalation and take the necessary action at your earliest convenience.</p>
                    
                    <div class="footer">
                        <p>Thank you,<br>
                        <strong>MANIT Hostel Escalation System</strong></p>
                        
                        <p><small>This is an automated message from MANIT Hostel Office. Please do not reply to this email.</small></p>
                    </div>
                </div>
            </body>
            </html>
        `;
                
        const response = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: hodEmail,
                subject,
                body,
                type: 'new-escalation'
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        const result = await response.json();
        
        if (result.success) {
            if (result.skipped) {
                console.log(`⚠️ Notification skipped for escalation #${escalationId} to ${hodEmail} - SendGrid not configured`);
            } else {
                console.log(`✅ Notification email sent for escalation #${escalationId} to ${hodEmail}`);
            }
        } else {
            console.error(`❌ Failed to send notification for escalation #${escalationId} to ${hodEmail}`);
        }
        
        return result;

    } catch (error) {
        console.error(`Failed to send notification for escalation #${escalationId}:`, error);
        return { success: false };
    }
}

interface TeamMemberAssignmentNotificationProps {
    teamMemberEmail: string;
    escalationId: string;
    studentName: string;
    department: string;
    hodName: string;
    description: string;
}

export async function sendTeamMemberAssignmentNotification(props: TeamMemberAssignmentNotificationProps) {
    const { teamMemberEmail, escalationId, studentName, department, hodName, description } = props;
    
    try {
        const subject = `New Task Assignment: Escalation #${escalationId}`;
        
        // Enhanced HTML email template for team members with MANIT branding
        const body = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; padding: 20px; border-radius: 8px; margin-bottom: 20px; color: white; text-align: center; }
                    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
                    .escalation-id { color: #dc3545; font-weight: bold; }
                    .department { color: #007bff; font-weight: bold; }
                    .student-name { color: #28a745; font-weight: bold; }
                    .hod-name { color: #6f42c1; font-weight: bold; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; }
                    .action-button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="color: white;">MANIT Hostel Escalation System</h2>
                        <h2>🎯 New Task Assignment</h2>
                    </div>
                    
                    <p>Dear Team Member,</p>
                    
                    <p>You have been assigned a new escalation task by <span class="hod-name">${hodName}</span> (Supervisor).</p>
                    
                    <h3>📋 Task Details:</h3>
                    <ul>
                        <li><strong>Escalation ID:</strong> <span class="escalation-id">#${escalationId}</span></li>
                        <li><strong>Department:</strong> <span class="department">${department}</span></li>
                        <li><strong>Student:</strong> <span class="student-name">${studentName}</span></li>
                        <li><strong>Assigned by:</strong> <span class="hod-name">${hodName}</span></li>
                        <li><strong>Assigned on:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    
                    <h3>📝 Description:</h3>
                    <p>${description}</p>
                    
                    <p>Please review this escalation and begin working on it immediately. You can update the status and add comments as you progress.</p>
                    
                    <div class="footer">
                        <p>Thank you,<br>
                        <strong>MANIT Hostel Escalation System</strong></p>
                        
                        <p><small>This is an automated message from MANIT Hostel Office. Please do not reply to this email.</small></p>
                    </div>
                </div>
            </body>
            </html>
        `;
                
        const response = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: teamMemberEmail,
                subject,
                body,
                type: 'team-member-assignment'
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        const result = await response.json();
        
        if (result.success) {
            if (result.skipped) {
                console.log(`⚠️ Notification skipped for escalation #${escalationId} to ${teamMemberEmail} - SendGrid not configured`);
            } else {
                console.log(`✅ Team member assignment notification sent for escalation #${escalationId} to ${teamMemberEmail}`);
            }
        } else {
            console.error(`❌ Failed to send team member assignment notification for escalation #${escalationId} to ${teamMemberEmail}`);
        }
        
        return result;

    } catch (error) {
        console.error(`Failed to send team member assignment notification for escalation #${escalationId}:`, error);
        return { success: false };
    }
}

interface EscalationStatusUpdateNotificationProps {
    escalationId: string;
    studentName: string;
    department: string;
    oldStatus: string;
    newStatus: string;
    updatedBy: string;
}

export async function sendEscalationStatusUpdateNotification(props: EscalationStatusUpdateNotificationProps) {
    const { escalationId, studentName, department, oldStatus, newStatus, updatedBy } = props;
    
    try {
        const subject = `Escalation Status Updated: #${escalationId}`;
        
        // Enhanced HTML email template for Hostel Office users with MANIT branding
        const body = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #28a745; padding: 20px; border-radius: 8px; margin-bottom: 20px; color: white; text-align: center; }
                    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
                    .escalation-id { color: #dc3545; font-weight: bold; }
                    .department { color: #007bff; font-weight: bold; }
                    .student-name { color: #28a745; font-weight: bold; }
                    .status-change { color: #ffc107; font-weight: bold; }
                    .updated-by { color: #6f42c1; font-weight: bold; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="color: white;">MANIT Hostel Escalation System</h2>
                        <h2>📊 Escalation Status Update</h2>
                    </div>
                    
                    <p>Dear Hostel Office Team,</p>
                    
                    <p>An escalation status has been updated and requires your attention.</p>
                    
                    <h3>📋 Escalation Details:</h3>
                    <ul>
                        <li><strong>Escalation ID:</strong> <span class="escalation-id">#${escalationId}</span></li>
                        <li><strong>Department:</strong> <span class="department">${department}</span></li>
                        <li><strong>Student:</strong> <span class="student-name">${studentName}</span></li>
                        <li><strong>Status Change:</strong> <span class="status-change">${oldStatus} → ${newStatus}</span></li>
                        <li><strong>Updated by:</strong> <span class="updated-by">${updatedBy}</span></li>
                        <li><strong>Updated on:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    
                    <p>Please review this status change and take any necessary follow-up actions.</p>
                    
                    <div class="footer">
                        <p>Thank you,<br>
                        <strong>MANIT Hostel Escalation System</strong></p>
                        
                        <p><small>This is an automated message from MANIT Hostel Office. Please do not reply to this email.</small></p>
                    </div>
                </div>
            </body>
            </html>
        `;
                
        const response = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'hostel.office@example.com', // This will be replaced with actual Hostel Office emails
                subject,
                body,
                type: 'escalation-status-update'
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        const result = await response.json();
        
        if (result.success) {
            if (result.skipped) {
                console.log(`⚠️ Hostel Office notification skipped for escalation #${escalationId} - SendGrid not configured`);
            } else {
                console.log(`✅ Hostel Office notification sent for escalation #${escalationId}`);
            }
        } else {
            console.error(`❌ Failed to send Hostel Office notification for escalation #${escalationId}`);
        }
        
        return result;

    } catch (error) {
        console.error(`Failed to send Hostel Office notification for escalation #${escalationId}:`, error);
        return { success: false };
    }
}
