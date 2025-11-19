// test-sendgrid.js - Run this with Node.js to test SendGrid
const sgMail = require('@sendgrid/mail');

// Load environment variables (if using dotenv)
require('dotenv').config({ path: '.env.local' });

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const testEmail = async () => {
    const msg = {
        to: 'gouravshukla337@gmail.com',
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'SendGrid Test from Console',
        text: 'Hello, this is a test email from your SendGrid setup!',
        html: '<strong>Hello, this is a test email from your SendGrid setup!</strong>',
    };

    try {
        console.log('🚀 Sending test email...');
        console.log('To:', msg.to);
        console.log('From:', msg.from);
        console.log('API Key:', process.env.SENDGRID_API_KEY ? 'Set ✅' : 'Missing ❌');
        
        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', response[0].headers['x-message-id']);
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Body:', error.response.body);
        }
    }
};

// Run the test
testEmail();