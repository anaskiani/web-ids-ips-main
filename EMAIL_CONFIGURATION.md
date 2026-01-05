# Email Configuration Guide for OTP

This guide will help you configure email settings so that OTP codes are sent to users' email addresses.

## Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

This will install the `dotenv` package needed to load environment variables.

### Step 2: Create .env File

Create a file named `.env` in the project root directory (same folder as `server.js`).

**For Gmail (Recommended):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Outlook/Hotmail:**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**For Yahoo Mail:**

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Step 3: Get Gmail App Password (If using Gmail)

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device
   - Enter "Web IDS IPS" as the name
   - Click "Generate"
   - Copy the 16-character password (spaces don't matter)

3. **Use the App Password:**
   - In your `.env` file, use the generated app password (not your regular Gmail password)
   - **You can use it WITH or WITHOUT spaces** - both work the same way
   - Example with spaces: `SMTP_PASS=abcd efgh ijkl mnop`
   - Example without spaces: `SMTP_PASS=abcdefghijklmnop`
   - **Both formats work identically!** Choose whichever is easier for you.

## Complete .env File Example

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcd efgh ijkl mnop

# Optional: Session Secret (auto-generated if not set)
# SESSION_SECRET=your-random-secret-key-here
```

## Step 4: Restart Your Server

After creating the `.env` file, restart your server:

```bash
npm start
```

## Testing Email Configuration

1. **Start the server** - You should see no email errors in the console
2. **Try to register** a new account
3. **Try to login** - You should receive an OTP code via email
4. **Check your email inbox** (and spam folder if needed)

## Verification

When email is properly configured, you should see:
- ✅ `✅ Email sent successfully to [email]` in server console
- ✅ OTP code received in your email inbox
- ✅ No OTP displayed on the login page (only in email)

## Troubleshooting

### Problem: "Email sending failed" error

**Solution:**
- For Gmail: Make sure you're using an **App Password**, not your regular password
- Check that 2-Step Verification is enabled
- Verify the email address in `SMTP_USER` is correct
- **About spaces in App Password:** Gmail displays App Passwords with spaces (like "abcd efgh ijkl mnop"), but you can use them WITH or WITHOUT spaces in your `.env` file - both work identically. Just make sure you don't have extra characters or typos.

### Problem: "Invalid login" or "Authentication failed"

**Solution:**
- Gmail requires App Passwords for SMTP
- Make sure you generated a new App Password
- Try generating a new App Password if the old one doesn't work

### Problem: Emails going to spam

**Solution:**
- This is normal for automated emails
- Check your spam/junk folder
- Add the sender email to your contacts
- Mark the email as "Not Spam"

### Problem: "Connection timeout" or "ECONNREFUSED"

**Solution:**
- Check your internet connection
- Verify SMTP_HOST and SMTP_PORT are correct
- Check firewall settings
- For Gmail, make sure "Less secure app access" is not needed (use App Password instead)

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to Git
- The `.env` file is already in `.gitignore`
- Keep your App Password secret
- Don't share your `.env` file

## Alternative: Environment Variables (Without .env file)

If you prefer not to use a `.env` file, you can set environment variables directly:

**Windows PowerShell:**
```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="your-email@gmail.com"
$env:SMTP_PASS="your-app-password"
npm start
```

**Windows CMD:**
```cmd
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_USER=your-email@gmail.com
set SMTP_PASS=your-app-password
npm start
```

**Linux/Mac:**
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASS=your-app-password
npm start
```

## Need Help?

If you're still having issues:
1. Check the server console for detailed error messages
2. Verify your email credentials are correct
3. Make sure the server was restarted after creating `.env`
4. Check that `dotenv` package is installed (`npm install`)
