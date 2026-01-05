/**
 * Email Configuration Setup Helper
 * Run this script to test your email configuration
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n📧 Email Configuration Test\n');
console.log('='.repeat(50));

// Check if environment variables are set
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

console.log(`SMTP Host: ${smtpHost}`);
console.log(`SMTP Port: ${smtpPort}`);
console.log(`SMTP User: ${smtpUser || '❌ NOT SET'}`);
console.log(`SMTP Pass: ${smtpPass ? '✅ SET (hidden)' : '❌ NOT SET'}`);
console.log('='.repeat(50));

if (!smtpUser || !smtpPass) {
    console.log('\n❌ Email configuration is incomplete!');
    console.log('\nPlease create a .env file with the following:');
    console.log('\nSMTP_HOST=smtp.gmail.com');
    console.log('SMTP_PORT=587');
    console.log('SMTP_USER=your-email@gmail.com');
    console.log('SMTP_PASS=your-app-password');
    console.log('\nSee EMAIL_CONFIGURATION.md for detailed instructions.');
    process.exit(1);
}

// Test email configuration with multiple methods
console.log('\n🧪 Testing email configuration...\n');

// Try different configurations
const configs = [
    { name: 'Port 587 (TLS)', port: 587, secure: false, requireTLS: true },
    { name: 'Port 465 (SSL)', port: 465, secure: true, requireTLS: false },
    { name: 'Port 587 (No TLS requirement)', port: 587, secure: false, requireTLS: false }
];

async function testConfig(config) {
    return new Promise((resolve) => {
        console.log(`Trying: ${config.name}...`);
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: config.port,
            secure: config.secure,
            requireTLS: config.requireTLS,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false // For testing only
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        transporter.verify((error, success) => {
            if (error) {
                console.log(`  ❌ Failed: ${error.message}\n`);
                resolve(false);
            } else {
                console.log(`  ✅ SUCCESS! ${config.name} works!\n`);
                resolve(true);
            }
        });
    });
}

async function runTests() {
    for (const config of configs) {
        const success = await testConfig(config);
        if (success) {
            console.log('✅ Email configuration test PASSED!');
            console.log(`\nWorking configuration:`);
            console.log(`  SMTP_HOST=${smtpHost}`);
            console.log(`  SMTP_PORT=${config.port}`);
            console.log(`  Use secure: ${config.secure}`);
            console.log(`\nUpdate your .env file with:`);
            console.log(`SMTP_PORT=${config.port}`);
            if (config.secure) {
                console.log(`\nAlso update server.js to use secure: true for port ${config.port}`);
            }
            console.log('\nYour email is properly configured.');
            console.log('OTP codes will now be sent to users\' email addresses.');
            process.exit(0);
        }
    }
    
    // If all failed
    console.log('\n❌ All email configuration tests FAILED!\n');
    console.log('Error: Connection timeout to Gmail SMTP server');
    console.log('\nPossible solutions:');
    console.log('1. 🔥 Firewall/Network Issue:');
    console.log('   - Your firewall or network may be blocking port 587/465');
    console.log('   - Try disabling firewall temporarily to test');
    console.log('   - Check if your ISP blocks SMTP ports');
    console.log('   - Try from a different network (mobile hotspot)');
    console.log('\n2. 📧 Gmail Settings:');
    console.log('   - Make sure you\'re using an App Password (not regular password)');
    console.log('   - Verify 2-Step Verification is enabled');
    console.log('   - Check: https://myaccount.google.com/apppasswords');
    console.log('\n3. 🌐 Alternative: Use a different email provider');
    console.log('   - Try Outlook: SMTP_HOST=smtp-mail.outlook.com');
    console.log('   - Try Yahoo: SMTP_HOST=smtp.mail.yahoo.com');
    console.log('\n4. 🔧 Network Configuration:');
    console.log('   - Check if you\'re behind a corporate firewall');
    console.log('   - Try using a VPN');
    console.log('   - Contact your network administrator');
    process.exit(1);
}

runTests();
