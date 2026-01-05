// ================= IMPORTS =================
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
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
