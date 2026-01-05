// ================= IMPORTS =================
require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const crypto = require("crypto");
const db = require("./database/initDb");


// ================= APP INIT =================
const app = express();


const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// ================= BASIC MIDDLEWARE =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ================= SESSION CONFIGURATION =================
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ================= EMAIL CONFIGURATION =================
// Determine if we should use secure connection (SSL) based on port
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const useSecure = smtpPort === 465; // Port 465 requires SSL

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: useSecure, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates if needed
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// Helper function to send email (fallback if email not configured)
async function sendEmail(to, subject, text) {
    const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (!hasEmailConfig) {
        console.log(`\n📧 ===== EMAIL NOT CONFIGURED =====`);
        console.log(`📧 To: ${to}`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`📧 Message: ${text}`);
        console.log(`📧 ====================================\n`);
        return { success: false, mode: 'console', message: 'Email not configured - check console' };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            text: text
        });
        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true, mode: 'email', messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email sending failed:`, error.message);
        console.error(`📧 Email details - To: ${to}, Subject: ${subject}`);
        console.error(`📧 Full error:`, error);
        return { success: false, mode: 'error', error: error.message };
    }
}

// ================= LOGS FOLDER =================
if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}

// ================= IDS / IPS CONFIG =================
const attackRegex = /(\b(or|and)\b\s+\d+\s*=\s*\d+|union\s+select|select\s+.+\s+from|insert\s+into|drop\s+table|update\s+.+\s+set|delete\s+from|<\s*script|javascript:|onerror\s*=|onload\s*=)/i;


const attackCounter = {};     // { ip: count }
const blockedIPs = new Set(); // IPS blocked IPs

// ================= IDS + IPS MIDDLEWARE =================
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    let userInput = "";

    // 🛑 IPS BLOCK
    if (blockedIPs.has(ip)) {
        return res.status(403).send("🚫 IPS: Your IP is blocked");
    }

    // Collect QUERY data
    if (req.query && typeof req.query === "object") {
        Object.values(req.query).forEach(v => {
            if (v) userInput += v + " ";
        });
    }

    // Collect BODY data
    if (req.body && typeof req.body === "object") {
        Object.values(req.body).forEach(v => {
            if (v) userInput += v + " ";
        });
    }

    // 🚨 IDS DETECTION
    if (attackRegex.test(userInput)) {
        attackCounter[ip] = (attackCounter[ip] || 0) + 1;

        fs.appendFileSync(
            "logs/attacks.log",
            `${new Date().toISOString()} | ${ip} | ${userInput}\n`
        );

        db.query(
            "INSERT INTO attack_logs (ip, payload) VALUES (?, ?)",
            [ip, userInput]
        );

        console.log(`🚨 IDS ALERT (${attackCounter[ip]}) from ${ip}`);

        // 🛑 IPS AFTER 3 ATTEMPTS
        if (attackCounter[ip] >= 3) {
            blockedIPs.add(ip);
            console.log(`🛑 IPS BLOCKED IP: ${ip}`);
            return res.status(403).send("🛑 IPS: You are blocked");
        }

        return res.status(400).send("🚨 Malicious input detected");
    }

    next();
});

// ================= AUTHENTICATION MIDDLEWARE =================
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// ================= ROUTES =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.get("/login", (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ================= AUTHENTICATION ROUTES =================

// Register new user
app.post("/auth/register", async (req, res) => {
    const { email, password, securityQuestion, securityAnswer } = req.body;

    if (!email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    try {
        // Check if user already exists
        db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error("❌ DB ERROR:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }

            // Hash password and security answer
            const passwordHash = await bcrypt.hash(password, 10);
            const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

            // Generate OTP secret (random string for future use)
            const otpSecret = crypto.randomBytes(16).toString('hex');

            // Insert user
            db.query(
                "INSERT INTO users (email, password_hash, security_question, security_answer_hash, otp_secret) VALUES (?, ?, ?, ?, ?)",
                [email, passwordHash, securityQuestion, securityAnswerHash, otpSecret],
                (err, result) => {
                    if (err) {
                        console.error("❌ DB ERROR:", err);
                        return res.status(500).json({ success: false, message: "Failed to create account" });
                    }

                    console.log(`✅ User registered: ${email}`);
                    res.json({ success: true, message: "Account created successfully" });
                }
            );
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// Login Step 1: Email & Password
app.post("/auth/login-step1", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    db.query("SELECT id, password_hash, security_question FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ DB ERROR:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store session in database
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        db.query(
            "INSERT INTO login_sessions (user_id, session_token, step_completed, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, ?)",
            [user.id, sessionToken, 1, otpCode, otpExpiresAt],
            async (err) => {
                if (err) {
                    console.error("❌ DB ERROR:", err);
                    return res.status(500).json({ success: false, message: "Failed to create session" });
                }

                // Send OTP via email
                const emailResult = await sendEmail(email, "Your Login OTP Code", `Your OTP code is: ${otpCode}\n\nThis code will expire in 5 minutes.`);
                
                // In development mode or if email fails, include OTP in response
                const isDevelopment = process.env.NODE_ENV !== 'production' || !process.env.SMTP_USER;
                const responseMessage = emailResult.success 
                    ? "Password verified. OTP sent to your email."
                    : "Password verified. Check console for OTP (email not configured).";

                console.log(`✅ Login Step 1 completed for: ${email}`);
                console.log(`🔑 OTP Code: ${otpCode} (expires in 5 minutes)`);
                
                res.json({
                    success: true,
                    sessionToken: sessionToken,
                    message: responseMessage,
                    // Include OTP in development mode for testing
                    ...(isDevelopment && { otp: otpCode, note: "OTP shown in development mode - check console or this response" })
                });
            }
        );
    });
});

// Login Step 2: OTP Verification
app.post("/auth/login-step2", (req, res) => {
    const { sessionToken, otp } = req.body;

    if (!sessionToken || !otp) {
        return res.status(400).json({ success: false, message: "Session token and OTP are required" });
    }

    db.query(
        "SELECT ls.*, u.security_question FROM login_sessions ls JOIN users u ON ls.user_id = u.id WHERE ls.session_token = ? AND ls.step_completed = 1",
        [sessionToken],
        (err, results) => {
            if (err) {
                console.error("❌ DB ERROR:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: "Invalid or expired session" });
            }

            const session = results[0];

            // Check if OTP expired
            if (new Date() > new Date(session.otp_expires_at)) {
                return res.status(401).json({ success: false, message: "OTP has expired. Please request a new one." });
            }

            // Verify OTP
            if (session.otp_code !== otp) {
                return res.status(401).json({ success: false, message: "Invalid OTP code" });
            }

            // Update session to step 2
            db.query(
                "UPDATE login_sessions SET step_completed = 2 WHERE session_token = ?",
                [sessionToken],
                (err) => {
                    if (err) {
                        console.error("❌ DB ERROR:", err);
                        return res.status(500).json({ success: false, message: "Failed to update session" });
                    }

                    console.log(`✅ Login Step 2 completed for session: ${sessionToken}`);
                    res.json({
                        success: true,
                        securityQuestion: session.security_question,
                        message: "OTP verified. Please answer the security question."
                    });
                }
            );
        }
    );
});

// Resend OTP
app.post("/auth/resend-otp", async (req, res) => {
    const { sessionToken } = req.body;

    if (!sessionToken) {
        return res.status(400).json({ success: false, message: "Session token is required" });
    }

    db.query(
        "SELECT ls.*, u.email, u.otp_secret FROM login_sessions ls JOIN users u ON ls.user_id = u.id WHERE ls.session_token = ? AND ls.step_completed = 1",
        [sessionToken],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ success: false, message: "Invalid session" });
            }

            const session = results[0];

            // Generate new 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            db.query(
                "UPDATE login_sessions SET otp_code = ?, otp_expires_at = ? WHERE session_token = ?",
                [otpCode, otpExpiresAt, sessionToken],
                async (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: "Failed to resend OTP" });
                    }

                    const emailResult = await sendEmail(session.email, "Your Login OTP Code", `Your OTP code is: ${otpCode}\n\nThis code will expire in 5 minutes.`);
                    
                    const isDevelopment = process.env.NODE_ENV !== 'production' || !process.env.SMTP_USER;
                    const responseMessage = emailResult.success 
                        ? "OTP has been resent to your email."
                        : "OTP regenerated. Check console (email not configured).";

                    console.log(`🔑 New OTP Code: ${otpCode} (expires in 5 minutes)`);

                    res.json({ 
                        success: true, 
                        message: responseMessage,
                        // Include OTP in development mode for testing
                        ...(isDevelopment && { otp: otpCode, note: "OTP shown in development mode" })
                    });
                }
            );
        }
    );
});

// Login Step 3: Security Question
app.post("/auth/login-step3", async (req, res) => {
    const { sessionToken, securityAnswer } = req.body;

    if (!sessionToken || !securityAnswer) {
        return res.status(400).json({ success: false, message: "Session token and security answer are required" });
    }

    db.query(
        "SELECT ls.*, u.id as user_id, u.email, u.security_answer_hash FROM login_sessions ls JOIN users u ON ls.user_id = u.id WHERE ls.session_token = ? AND ls.step_completed = 2",
        [sessionToken],
        async (err, results) => {
            if (err) {
                console.error("❌ DB ERROR:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: "Invalid or expired session" });
            }

            const session = results[0];

            // Verify security answer
            const answerMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), session.security_answer_hash);

            if (!answerMatch) {
                return res.status(401).json({ success: false, message: "Incorrect security answer" });
            }

            // Update session to step 3 and create user session
            db.query(
                "UPDATE login_sessions SET step_completed = 3 WHERE session_token = ?",
                [sessionToken],
                (err) => {
                    if (err) {
                        console.error("❌ DB ERROR:", err);
                        return res.status(500).json({ success: false, message: "Failed to complete login" });
                    }

                    // Update last login
                    db.query(
                        "UPDATE users SET last_login = NOW() WHERE id = ?",
                        [session.user_id]
                    );

                    // Create Express session
                    req.session.userId = session.user_id;
                    req.session.email = session.email;

                    console.log(`✅ Login completed for: ${session.email}`);

                    res.json({
                        success: true,
                        redirectUrl: "/dashboard",
                        message: "Login successful!"
                    });
                }
            );
        }
    );
});

// Get user info
app.get("/auth/user-info", requireAuth, (req, res) => {
    db.query("SELECT id, email, created_at, last_login FROM users WHERE id = ?", [req.session.userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ success: false, message: "Failed to fetch user info" });
        }

        res.json({ success: true, user: results[0] });
    });
});

// Logout
app.get("/auth/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error("❌ Logout error:", err);
            }
        });
    }
    res.redirect('/login');
});

// ================= CONTACT FORM =================
app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    // Safety check
    if (!name || !email || !message) {
        return res.status(400).send("All fields are required");
    }

    db.query(
        "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
        [name, email, message],
        (err, result) => {
            if (err) {
                console.error("❌ DB ERROR:", err);
                // Temporary: return error message for debugging on this machine
                return res.status(500).send("Database error: " + (err && err.message ? err.message : String(err)));
            }

            console.log("✅ Message saved to DB (Email disabled)");

            // Send success response
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Message Sent</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; border: 1px solid #e1e4e8; max-width: 400px; width: 100%; animation: fadeIn 0.5s ease-out; }
                        .success-icon { color: #28a745; font-size: 64px; margin-bottom: 20px; }
                        h1 { color: #2c3e50; margin: 0 0 10px 0; font-size: 28px; }
                        p { color: #6c757d; margin-bottom: 30px; font-size: 16px; line-height: 1.5; }
                        .btn { display: inline-block; padding: 12px 28px; background-color: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background-color 0.3s, transform 0.2s; box-shadow: 0 4px 6px rgba(0,123,255,0.25); }
                        .btn:hover { background-color: #0056b3; transform: translateY(-2px); }
                        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="success-icon">✓</div>
                        <h1>Message Sent!</h1>
                        <p>Thank you <b>${name}</b>, your message has been securely recorded.</p>
                        <a href="/" class="btn">Return Home</a>
                    </div>
                </body>
                </html>
            `);

        }
    );
});

// ================= ADMIN: MESSAGES =================
app.get("/admin/messages", (req, res) => {
    db.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, results) => {
        if (err) return res.send("DB error");

        let html = `
        <html><body>
        <h2>📨 Contact Messages</h2>
        <table border="1" cellpadding="8">
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr>
        `;

        results.forEach(r => {
            html += `<tr>
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.email}</td>
                <td>${r.message}</td>
                <td>${r.created_at}</td>
            </tr>`;
        });

        html += "</table></body></html>";
        res.send(html);
    });
});

// ================= ADMIN: ATTACK LOGS =================
app.get("/admin/attacks", (req, res) => {
    db.query("SELECT * FROM attack_logs ORDER BY detected_at DESC", (err, results) => {
        if (err) return res.send("DB error");

        let html = `
        <html><body>
        <h2>🚨 IDS Attack Logs</h2>
        <table border="1" cellpadding="8">
        <tr><th>ID</th><th>IP</th><th>Payload</th><th>Date</th></tr>
        `;

        results.forEach(r => {
            html += `<tr>
                <td>${r.id}</td>
                <td>${r.ip}</td>
                <td>${r.payload}</td>
                <td>${r.detected_at}</td>
            </tr>`;
        });

        html += "</table></body></html>";
        res.send(html);
    });
});

// ================= SERVER START =================


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
