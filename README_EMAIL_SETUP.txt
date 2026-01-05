===========================================
QUICK EMAIL SETUP FOR OTP VERIFICATION
===========================================

STEP 1: Install Dependencies
-----------------------------
Run: npm install

STEP 2: Create .env File
-------------------------
Create a file named ".env" in the project root with:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

STEP 3: Get Gmail App Password
-------------------------------
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Enter "Web IDS IPS" as name
6. Click "Generate"
7. Copy the 16-character password (it may have spaces like "abcd efgh ijkl mnop")
8. Paste it in .env file as SMTP_PASS
   NOTE: You can use it WITH or WITHOUT spaces - both work the same!
   Example: SMTP_PASS=abcd efgh ijkl mnop  (with spaces)
   Example: SMTP_PASS=abcdefghijklmnop      (without spaces)

STEP 4: Test Email Configuration
---------------------------------
Run: npm run test-email

STEP 5: Start Server
--------------------
Run: npm start

That's it! OTP codes will now be sent via email.

For detailed instructions, see: EMAIL_CONFIGURATION.md
