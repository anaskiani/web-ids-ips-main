# How to Disable/Configure Windows Firewall for Email Testing

## ⚠️ IMPORTANT SECURITY WARNING

**Disabling your firewall completely is NOT recommended for security reasons!**

Instead, we'll show you:
1. **Recommended:** Add an exception for Node.js (safer)
2. **Alternative:** Temporarily disable firewall (for testing only)

---

## Method 1: Add Exception for Node.js (RECOMMENDED - Safer)

This allows Node.js to access the internet without disabling your entire firewall.

### Step 1: Open Windows Defender Firewall
1. Press `Windows Key + R`
2. Type: `firewall.cpl`
3. Press Enter

### Step 2: Allow an App Through Firewall
1. Click **"Allow an app or feature through Windows Defender Firewall"** (on the left)
2. Click **"Change settings"** button (top right)
3. Click **"Allow another app..."** button (bottom)
4. Click **"Browse..."** button
5. Navigate to your Node.js installation:
   - Usually: `C:\Program Files\nodejs\node.exe`
   - Or: `C:\Users\YourUsername\AppData\Roaming\npm\node.exe`
6. Select `node.exe` and click **"Add"**
7. Make sure both **Private** and **Public** checkboxes are checked
8. Click **"OK"**

### Step 3: Test Again
```bash
npm run test-email
```

---

## Method 2: Temporarily Disable Firewall (FOR TESTING ONLY)

**⚠️ WARNING: Only do this for testing! Re-enable immediately after!**

### Option A: Using Windows Settings

1. Press `Windows Key + I` (opens Settings)
2. Go to **"Privacy & Security"** → **"Windows Security"**
3. Click **"Firewall & network protection"**
4. Click on your active network (usually "Private network" or "Public network")
5. Toggle **"Microsoft Defender Firewall"** to **OFF**
6. Click **"Yes"** to confirm

### Option B: Using Control Panel

1. Press `Windows Key + R`
2. Type: `firewall.cpl`
3. Press Enter
4. Click **"Turn Windows Defender Firewall on or off"** (on the left)
5. For both **Private** and **Public** networks:
   - Select **"Turn off Windows Defender Firewall"**
6. Click **"OK"**

### Option C: Using PowerShell (Quick Method)

**Open PowerShell as Administrator:**
1. Press `Windows Key + X`
2. Select **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
3. Run these commands:

```powershell
# Disable firewall for all profiles
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# To re-enable later:
# Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### ⚠️ RE-ENABLE FIREWALL AFTER TESTING!

**To re-enable using PowerShell:**
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

**Or using Settings:**
- Go back to Windows Security → Firewall & network protection
- Toggle it back **ON**

---

## Method 3: Check if Firewall is the Problem

Before disabling, test if the ports are accessible:

### Test Port 587:
```powershell
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
```

### Test Port 465:
```powershell
Test-NetConnection -ComputerName smtp.gmail.com -Port 465
```

**If both show "TcpTestSucceeded : False"**, the firewall or network is likely blocking it.

---

## Method 4: Disable Antivirus Firewall (If Using Third-Party Antivirus)

If you're using antivirus software (Norton, McAfee, Kaspersky, etc.):

1. Open your antivirus software
2. Look for "Firewall" or "Network Protection" settings
3. Temporarily disable it
4. Test email connection
5. **Re-enable immediately after testing**

---

## Quick Test Workflow

1. **First, try Method 1** (Add exception) - This is the safest
2. If that doesn't work, **temporarily disable firewall** (Method 2)
3. **Test email**: `npm run test-email`
4. **Re-enable firewall immediately**
5. If it worked, use Method 1 to add a permanent exception

---

## Alternative: Use Different Network

Instead of disabling firewall, you can:
- Use mobile hotspot
- Connect to different Wi-Fi network
- Use a VPN (if allowed)

This helps determine if it's a firewall or network issue.

---

## Still Having Issues?

If disabling firewall doesn't help, the issue might be:
- **ISP blocking SMTP ports** (common in some regions)
- **Corporate network restrictions**
- **Router firewall** (check router settings)
- **Gmail blocking your IP** (try from different network)

In these cases, try:
- Port 465 instead of 587
- Different email provider (Outlook, Yahoo)
- Different network location
