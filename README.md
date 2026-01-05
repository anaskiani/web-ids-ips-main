# 🛡️ Web IDS / IPS System

A web-based **Intrusion Detection System (IDS)** and **Intrusion Prevention System (IPS)** built with Node.js, Express, and MySQL.

## 🚀 Features

*   **Intrusion Detection System (IDS)**:
    *   Detects SQL Injection (SQLi) and Cross-Site Scripting (XSS) patterns in real-time.
    *   Logs attacks to the database (`attack_logs`).
    *   Alerts the admin via console logs.
*   **Intrusion Prevention System (IPS)**:
    *   Automatically blocks IP addresses after **3 malicious attempts**.
    *   Denies access to blocked IPs.
*   **Secure Contact Form**:
    *   Saves messages to a MySQL database (`contact_messages`).
    *   Displays a professional confirmation page.
*   **Admin Panel**:
    *   `/admin/messages`: View customer messages.
    *   `/admin/attacks`: View a log of detected attacks.

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MySQL
*   **Frontend**: HTML5, CSS3

## ⚙️ Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your database in `database/initDb.js` or use a `.env` file.
4.  Start the server:
    ```bash
    node server.js
    ```
5.  Visit `http://localhost:3000`.

## 🧪 Testing IDS/IPS

Try entering a malicious payload like `' OR 1=1 --` in the contact form.
*   **First Attempt**: Warning "Malicious input detected".
*   **Third Attempt**: Your IP will be **BLOCKED**.

---
*Created for Cyber Security Project*
