import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';

export async function POST(request: NextRequest) {
    try {
        const { escalationId, studentName, department, oldStatus, newStatus, updatedBy } = await request.json();

        if (!escalationId || !studentName || !department || !oldStatus || !newStatus || !updatedBy) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

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

        // Send notification to all CRM users from Firestore
        const crmQuery = await adminDb.collection('employees')
            .where('isCRM', '==', true)
            .get();
        const crmUserEmails = crmQuery.docs.map(d => (d.data() as any).email).filter(Boolean);
        let successCount = 0;
        let errorCount = 0;

        const requestUrl = new URL(request.url);
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

        for (const crmEmail of crmUserEmails) {
            try {
                const response = await fetch(`${baseUrl}/api/notifications/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: crmEmail,
                        subject,
                        body,
                        type: 'escalation-status-update'
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        successCount++;
                        console.log(`✅ CRM notification sent to ${crmEmail} for escalation #${escalationId}`);
                    } else {
                        errorCount++;
                        console.error(`❌ Failed to send CRM notification to ${crmEmail} for escalation #${escalationId}`);
                    }
                } else {
                    errorCount++;
                    console.error(`❌ Failed to send CRM notification to ${crmEmail} for escalation #${escalationId}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Error sending CRM notification to ${crmEmail} for escalation #${escalationId}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `CRM notifications sent: ${successCount} successful, ${errorCount} failed`,
            totalSent: successCount,
            totalFailed: errorCount
        });

    } catch (error: any) {
        console.error('Error in CRM status update notification API:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
