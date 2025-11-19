import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Ensure this route runs on the Node.js runtime (not Edge)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, type } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if SendGrid is configured
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!sendGridApiKey || !sendGridFromEmail) {
      console.warn('SendGrid not configured. Skipping email notification.');
      return NextResponse.json({ 
        success: true, 
        message: 'Email notification skipped - SendGrid not configured',
        skipped: true
      });
    }

    // Initialize SendGrid
    sgMail.setApiKey(sendGridApiKey);

    const msg = {
      to,
      from: sendGridFromEmail,
      subject,
      html: body,
      text: body.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text
    };

    await sgMail.send(msg);

    return NextResponse.json({ 
      success: true, 
      message: 'Email notification sent successfully' 
    });
  } catch (error: any) {
    // Log detailed SendGrid error info if available
    const status = error?.response?.status;
    const body = error?.response?.body;
    console.error('Error sending notification:', {
      message: error?.message || 'Unknown error',
      status,
      body,
    });
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: process.env.NODE_ENV === 'development' ? { status, body } : undefined,
      },
      { status: 500 }
    );
  }
}
