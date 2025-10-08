const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Path to the database file
const dbPath = path.join(__dirname, "user_sessions.db");

// Remove old database file if exists (optional - for fresh start)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Create and open the database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE User_Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE,
    user_name TEXT,
    ip_address TEXT,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Sample Data
  db.run(`INSERT INTO User_Sessions (session_token, user_name, ip_address)
VALUES
('abc123token', 'GuestUser1', '192.168.0.10'),
('xyz789token', 'GuestUser2', '192.168.0.11')`);
 console.log("Database created and dummy data inserted.");
});

db.close();

module.exports = dbPath;
