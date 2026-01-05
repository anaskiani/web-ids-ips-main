# Email Connection Troubleshooting Guide

## Error: "connect ETIMEDOUT" or Connection Timeout

If you're getting a connection timeout error when testing email configuration, here are solutions:

### Solution 1: Try Port 465 (SSL) Instead of 587

Gmail supports two ports:
- **Port 587** (TLS) - May be blocked by some networks
- **Port 465** (SSL) - Alternative that might work better

**Update your `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

The server will automatically use SSL for port 465.

### Solution 2: Check Firewall Settings

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Firewall"
3. Make sure Node.js is allowed
4. Or temporarily disable firewall to test

**Antivirus Software:**
- Some antivirus software blocks SMTP ports
- Temporarily disable to test
- Add Node.js to exceptions

### Solution 3: Network/ISP Blocking

Some ISPs or networks block SMTP ports (587, 465) to prevent spam.

**Try:**
- Use a mobile hotspot to test
- Use a different network
- Contact your network administrator
- Use a VPN service

### Solution 4: Use Alternative Email Provider

If Gmail doesn't work, try these alternatives:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo Mail:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Solution 5: Check Gmail App Password

Make sure:
1. ✅ 2-Step Verification is enabled
2. ✅ You generated an App Password (not using regular password)
3. ✅ App Password is copied correctly (all 16 characters)
4. ✅ No extra spaces or characters

**Generate new App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Delete old password
3. Generate new one
4. Update `.env` file

### Solution 6: Test Connection Manually

**Using PowerShell (Windows):**
```powershell
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
Test-NetConnection -ComputerName smtp.gmail.com -Port 465
```

If both fail, your network is blocking SMTP ports.

### Solution 7: Corporate Network/VPN

If you're on a corporate network:
- Contact IT department
- They may need to whitelist SMTP ports
- Or use company email server instead

### Quick Test Commands

**Test with updated script:**
```bash
npm run test-email
```

This will try multiple configurations automatically.

**Check if ports are accessible:**
```bash
# Windows PowerShell
Test-NetConnection smtp.gmail.com -Port 587
Test-NetConnection smtp.gmail.com -Port 465
```

### Still Not Working?

1. **Check server.js logs** for detailed error messages
2. **Try from different network** (mobile hotspot)
3. **Use alternative email provider** (Outlook, Yahoo)
4. **Contact your network administrator** if on corporate network

### Common Error Messages

| Error | Solution |
|-------|----------|
| `ETIMEDOUT` | Network/firewall blocking - try port 465 or different network |
| `EAUTH` | Wrong password - use App Password, not regular password |
| `ECONNREFUSED` | Port blocked - try different port or network |
| `Invalid login` | Need App Password - enable 2-Step Verification first |
