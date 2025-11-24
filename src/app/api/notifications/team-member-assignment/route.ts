import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teamMemberEmail, escalationId, studentName, department, hodName, description } = body;

        // Validate required fields
        if (!teamMemberEmail || !escalationId || !studentName || !department || !hodName || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the email content
        const subject = `New Task Assignment: Escalation #${escalationId}`;
        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; padding: 20px; border-radius: 8px; margin-bottom: 20px; color: white; }
                    .escalation-id { color: #dc3545; font-weight: bold; }
                    .department { color: #007bff; font-weight: bold; }
                    .customer-name { color: #28a745; font-weight: bold; }
                    .hod-name { color: #6f42c1; font-weight: bold; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🎯 New Task Assignment</h2>
                    </div>
                    
                    <p>Dear Team Member,</p>
                    
                    <p>You have been assigned a new escalation task by <span class="hod-name">${hodName}</span> (Supervisor).</p>
                    
                    <h3>📋 Task Details:</h3>
                    <ul>
                        <li><strong>Escalation ID:</strong> <span class="escalation-id">#${escalationId}</span></li>
                        <li><strong>Department:</strong> <span class="department">${department}</span></li>
                        <li><strong>Student:</strong> <span class="customer-name">${studentName}</span></li>
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

        // Send the notification using the main notification API
        const requestUrl = new URL(request.url);
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
        const response = await fetch(`${baseUrl}/api/notifications/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: teamMemberEmail,
                subject,
                body: emailBody,
                type: 'team-member-assignment'
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        const result = await response.json();

        if (result.success) {
            return NextResponse.json({ 
                success: true, 
                message: result.message || 'Team member assignment notification sent successfully',
                skipped: result.skipped || false
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send notification' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in team member assignment notification API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
