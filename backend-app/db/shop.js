const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Path to the database file
const dbPath = path.join(__dirname, "shop.db");

// Remove old database file if exists (optional - for fresh start)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Create and open the database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE Table_Sales (
    Shop_Name TEXT,
    Order_No TEXT,
    Order_Date DATE,
    Invoice_No TEXT,
    Invoice_Date DATE,
    Item_Name TEXT,
    Item_Category_Name TEXT,
    Item_Qty INTEGER,
    Item_Rate REAL,
    Customer_Name TEXT,
    Customer_Address TEXT,
    Delivery_Date DATE,
    Delivery_Charge REAL
)`);

  const tableSalesStmt = db.prepare(
    `INSERT INTO Table_Sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`
  );

  const tableSalesData = [
    [
      "SuperMart",
      "ORD001",
      "2025-10-01",
      "INV001",
      "2025-10-01",
      "Pine Apple Biscuit",
      "Confectionary",
      20,
      15.5,
      "Rahim Uddin",
      "Dhaka",
      "2025-10-02",
      20,
    ],
    [
      "SuperMart",
      "ORD002",
      "2025-10-01",
      "INV002",
      "2025-10-01",
      "Coca Cola 500ml",
      "Beverage",
      30,
      25.0,
      "Karim Ali",
      "Chittagong",
      "2025-10-02",
      30,
    ],
    [
      "SuperMart",
      "ORD003",
      "2025-10-02",
      "INV003",
      "2025-10-02",
      "Mango Juice",
      "Beverage",
      25,
      20.0,
      "Selina Akter",
      "Dhaka",
      "2025-10-03",
      25,
    ],
    [
      "SuperMart",
      "ORD004",
      "2025-10-03",
      "INV004",
      "2025-10-03",
      "Milk Powder 1kg",
      "Grocery",
      10,
      80.0,
      "Abdul Hakim",
      "Rajshahi",
      "2025-10-04",
      40,
    ],
    [
      "SuperMart",
      "ORD005",
      "2025-10-03",
      "INV005",
      "2025-10-03",
      "Chocolate Bar",
      "Confectionary",
      15,
      10.0,
      "Mitu Akter",
      "Sylhet",
      "2025-10-04",
      15,
    ],
    [
      "MegaStore",
      "ORD006",
      "2025-09-25",
      "INV006",
      "2025-09-25",
      "Tea Pack",
      "Grocery",
      40,
      18.0,
      "Nasir Hossain",
      "Dhaka",
      "2025-09-26",
      25,
    ],
    [
      "MegaStore",
      "ORD007",
      "2025-09-29",
      "INV007",
      "2025-09-29",
      "Orange Juice",
      "Beverage",
      22,
      22.0,
      "Sadia Islam",
      "Khulna",
      "2025-09-30",
      20,
    ],
    [
      "MiniMart",
      "ORD008",
      "2025-09-30",
      "INV008",
      "2025-09-30",
      "Butter Biscuit",
      "Confectionary",
      18,
      12.0,
      "Farid Hossain",
      "Barisal",
      "2025-10-01",
      15,
    ],
  ];

  tableSalesData.forEach((row) => tableSalesStmt.run(row));
  tableSalesStmt.finalize();
  console.log("Database created and dummy data inserted.");
});

db.close();

module.exports = dbPath;
