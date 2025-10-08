const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Path to the database file
const dbPath = path.join(__dirname, "agent_training.db");

// Remove old database file if exists (optional - for fresh start)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Create and open the database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE Query_Log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_query TEXT NOT NULL,
    generated_sql TEXT,
    response_summary TEXT,
    suggestion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

  db.run(`CREATE TABLE Feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER,
    user_feedback TEXT CHECK(user_feedback IN ('like', 'dislike')),
    corrected_sql TEXT,
    feedback_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES Query_Log(id)
)`);

  // Sample Data
  db.run(`INSERT INTO Query_Log (user_query, generated_sql, response_summary, suggestion)
VALUES
('Show today sales amount of Pine Apple Biscuit',
 'SELECT SUM(Item_Qty * Item_Rate) AS Total_Sales FROM Table_Sales WHERE Item_Name = "Pine Apple Biscuit" AND Order_Date = date("now");',
 'Today sales of Pine Apple Biscuit: 310.00',
 'Compare with yesterday to see trend.')`);

  db.run(`INSERT INTO Feedback (query_id, user_feedback, feedback_note)
VALUES (1, 'like', 'Correct result.')`);

  console.log("Database created and dummy data inserted.");
});

db.close();

module.exports = dbPath;
