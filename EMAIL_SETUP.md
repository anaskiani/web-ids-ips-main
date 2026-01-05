# Email Configuration Guide

## Problem: Not Receiving OTP Emails

If you're not receiving OTP emails, it's because email (SMTP) is not configured. The system will show OTP codes in the console and on the login page in development mode.

## Quick Solution (Development/Testing)

**For testing purposes, the OTP code is displayed:**
1. In the browser console (F12 → Console tab)
2. On the login page (if email is not configured)
3. In the server console/terminal

## Setting Up Email (Production)

To enable actual email sending, you need to configure SMTP settings:

### Option 1: Environment Variables (Recommended)

Create a `.env` file in the project root:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Option 2: Gmail Setup

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password:**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password (not your regular password) as `SMTP_PASS`

3. **Set environment variables:**
   ```bash
   # Windows PowerShell
   $env:SMTP_USER="your-email@gmail.com"
   $env:SMTP_PASS="your-app-password"

   # Windows CMD
   set SMTP_USER=your-email@gmail.com
   set SMTP_PASS=your-app-password

   # Linux/Mac
   export SMTP_USER="your-email@gmail.com"
   export SMTP_PASS="your-app-password"
   ```

### Option 3: Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## Testing Email Configuration

After setting up email, restart your server and try logging in. Check:
1. Server console for email sending status
2. Your email inbox (and spam folder)
3. Server logs for any email errors

## Troubleshooting

### "Email not configured" message
- Set `SMTP_USER` and `SMTP_PASS` environment variables
- Restart the server after setting variables

### "Email sending failed" error
- Check your email credentials
- For Gmail: Use App Password, not regular password
- Check firewall/network settings
- Verify SMTP host and port are correct

### Emails going to spam
- This is normal for automated emails
- Check your spam/junk folder
- Add the sender email to contacts

## Current Status

If email is not configured, the system will:
- ✅ Still work perfectly
- ✅ Show OTP codes in console
- ✅ Display OTP on login page (development mode)
- ✅ Log all email attempts

This allows you to test the 3-factor authentication system without email setup!
