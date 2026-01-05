const mysql = require("mysql2");

const DB_NAME = process.env.DB_NAME || "web_ids_ips";

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

connection.connect(err => {
    if (err) {
        console.error("❌ MySQL connection failed:", err);
        return;
    }
    console.log("✅ MySQL Connected");

    // Create database (only if permitted)
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``, err => {
        if (err) {
            console.error("❌ DB creation failed:", err);
            return;
        }
        console.log("✅ Database ensured");

        connection.changeUser({ database: DB_NAME }, err => {
            if (err) {
                console.error("❌ DB select failed:", err);
                return;
            }

            // Create tables
            connection.query(`
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100),
                    message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS attack_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ip VARCHAR(50),
                    payload TEXT,
                    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `, err => {
                if (err) {
                    console.error("❌ Table creation failed:", err);
                } else {
                    console.log("✅ Tables ensured");
                }
            });
        });
    });
});

module.exports = connection;
