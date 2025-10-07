const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to the database file
const dbPath = path.join(__dirname, 'reports.db');

// Create database and tables
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create Item Master table
  db.run(`CREATE TABLE IF NOT EXISTS "Item Master" (
    "Id" INTEGER PRIMARY KEY,
    "Category_Name" TEXT,
    "Item_Name" TEXT,
    "Sales_Rate" REAL
  )`);

  // Create Inventory table
  db.run(`CREATE TABLE IF NOT EXISTS "Inventory" (
    "Id" INTEGER PRIMARY KEY,
    "Shop_Name" TEXT,
    "Item_Name" TEXT,
    "Stock_Qty" INTEGER
  )`);

  // Create Sales table
  db.run(`CREATE TABLE IF NOT EXISTS "Sales" (
    "Id" INTEGER PRIMARY KEY,
    "Shop_Name" TEXT,
    "Sales_Date" TEXT,
    "Customer_Name" TEXT,
    "Item_Name" TEXT,
    "Sales_Qty" INTEGER,
    "Sales_Rate" REAL,
    "Sales_Amount" REAL
  )`);

  // Create Purchase table
  db.run(`CREATE TABLE IF NOT EXISTS "Purchase" (
    "Id" INTEGER PRIMARY KEY,
    "Shop_Name" TEXT,
    "Purchase_Date" TEXT,
    "Supplier_Name" TEXT,
    "Item_Name" TEXT,
    "Purchase_Qty" INTEGER,
    "Purchase_Rate" REAL,
    "Purchase_Amount" REAL
  )`);

  console.log('Database and tables created.');
});

// Insert dummy data
db.serialize(() => {
  // Item Master - 20 entries
  const stmt1 = db.prepare(`INSERT OR IGNORE INTO "Item Master" VALUES (?, ?, ?, ?)`);
  stmt1.run(1, 'Confectionary', 'Chocolate', 50.0);
  stmt1.run(2, 'Beverage', 'Soda', 30.0);
  stmt1.run(3, 'Snacks', 'Biscuits', 20.0);
  stmt1.run(4, 'Dairy', 'Milk', 40.0);
  stmt1.run(5, 'Confectionary', 'Candy', 10.0);
  stmt1.run(6, 'Beverage', 'Juice', 35.0);
  stmt1.run(7, 'Snacks', 'Chips', 25.0);
  stmt1.run(8, 'Dairy', 'Cheese', 60.0);
  stmt1.run(9, 'Confectionary', 'Cake', 100.0);
  stmt1.run(10, 'Beverage', 'Tea', 15.0);
  stmt1.run(11, 'Snacks', 'Nuts', 80.0);
  stmt1.run(12, 'Dairy', 'Yogurt', 45.0);
  stmt1.run(13, 'Confectionary', 'Ice Cream', 70.0);
  stmt1.run(14, 'Beverage', 'Coffee', 20.0);
  stmt1.run(15, 'Snacks', 'Popcorn', 30.0);
  stmt1.run(16, 'Dairy', 'Butter', 55.0);
  stmt1.run(17, 'Confectionary', 'Cookies', 40.0);
  stmt1.run(18, 'Beverage', 'Water', 5.0);
  stmt1.run(19, 'Snacks', 'Crackers', 35.0);
  stmt1.run(20, 'Dairy', 'Cream', 65.0);
  stmt1.finalize();

  // Inventory - 20 entries
  const stmt2 = db.prepare(`INSERT OR IGNORE INTO "Inventory" VALUES (?, ?, ?, ?)`);
  stmt2.run(1, 'Shop A', 'Chocolate', 100);
  stmt2.run(2, 'Shop A', 'Soda', 200);
  stmt2.run(3, 'Shop A', 'Biscuits', 150);
  stmt2.run(4, 'Shop A', 'Milk', 80);
  stmt2.run(5, 'Shop A', 'Candy', 300);
  stmt2.run(6, 'Shop A', 'Juice', 120);
  stmt2.run(7, 'Shop A', 'Chips', 90);
  stmt2.run(8, 'Shop A', 'Cheese', 50);
  stmt2.run(9, 'Shop B', 'Chocolate', 75);
  stmt2.run(10, 'Shop B', 'Soda', 180);
  stmt2.run(11, 'Shop B', 'Biscuits', 200);
  stmt2.run(12, 'Shop B', 'Milk', 60);
  stmt2.run(13, 'Shop C', 'Cake', 40);
  stmt2.run(14, 'Shop C', 'Tea', 250);
  stmt2.run(15, 'Shop C', 'Nuts', 110);
  stmt2.run(16, 'Shop C', 'Yogurt', 90);
  stmt2.run(17, 'Shop D', 'Ice Cream', 30);
  stmt2.run(18, 'Shop D', 'Coffee', 160);
  stmt2.run(19, 'Shop D', 'Popcorn', 140);
  stmt2.run(20, 'Shop D', 'Butter', 70);
  stmt2.finalize();

  // Sales - 20 entries
  const stmt3 = db.prepare(`INSERT OR IGNORE INTO "Sales" VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt3.run(1, 'Shop A', '2023-10-01', 'John Doe', 'Chocolate', 5, 50.0, 250.0);
  stmt3.run(2, 'Shop A', '2023-10-02', 'Jane Smith', 'Soda', 10, 30.0, 300.0);
  stmt3.run(3, 'Shop A', '2023-10-03', 'Alice Johnson', 'Biscuits', 8, 20.0, 160.0);
  stmt3.run(4, 'Shop A', '2023-10-04', 'Bob Brown', 'Milk', 3, 40.0, 120.0);
  stmt3.run(5, 'Shop A', '2023-10-05', 'Charlie Davis', 'Candy', 15, 10.0, 150.0);
  stmt3.run(6, 'Shop B', '2023-10-01', 'Diana Evans', 'Chocolate', 4, 50.0, 200.0);
  stmt3.run(7, 'Shop B', '2023-10-02', 'Eve Foster', 'Juice', 6, 35.0, 210.0);
  stmt3.run(8, 'Shop B', '2023-10-03', 'Frank Garcia', 'Chips', 12, 25.0, 300.0);
  stmt3.run(9, 'Shop C', '2023-10-06', 'Grace Hill', 'Cake', 2, 100.0, 200.0);
  stmt3.run(10, 'Shop C', '2023-10-07', 'Henry Ingram', 'Tea', 20, 15.0, 300.0);
  stmt3.run(11, 'Shop C', '2023-10-08', 'Ivy Jones', 'Nuts', 5, 80.0, 400.0);
  stmt3.run(12, 'Shop C', '2023-10-09', 'Jack King', 'Yogurt', 7, 45.0, 315.0);
  stmt3.run(13, 'Shop D', '2023-10-10', 'Kate Lee', 'Ice Cream', 3, 70.0, 210.0);
  stmt3.run(14, 'Shop D', '2023-10-11', 'Liam Miller', 'Coffee', 10, 20.0, 200.0);
  stmt3.run(15, 'Shop D', '2023-10-12', 'Mia Nelson', 'Popcorn', 8, 30.0, 240.0);
  stmt3.run(16, 'Shop D', '2023-10-13', 'Noah Owen', 'Butter', 4, 55.0, 220.0);
  stmt3.run(17, 'Shop A', '2023-10-14', 'Olivia Parker', 'Cookies', 6, 40.0, 240.0);
  stmt3.run(18, 'Shop B', '2023-10-15', 'Quinn Reed', 'Water', 12, 5.0, 60.0);
  stmt3.run(19, 'Shop C', '2023-10-16', 'Ryan Scott', 'Crackers', 9, 35.0, 315.0);
  stmt3.run(20, 'Shop D', '2023-10-17', 'Sophia Taylor', 'Cream', 2, 65.0, 130.0);
  stmt3.finalize();

  // Purchase - 20 entries
  const stmt4 = db.prepare(`INSERT OR IGNORE INTO "Purchase" VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt4.run(1, 'Shop A', '2023-09-01', 'Supplier X', 'Chocolate', 50, 40.0, 2000.0);
  stmt4.run(2, 'Shop A', '2023-09-02', 'Supplier Y', 'Soda', 100, 25.0, 2500.0);
  stmt4.run(3, 'Shop A', '2023-09-03', 'Supplier Z', 'Biscuits', 200, 15.0, 3000.0);
  stmt4.run(4, 'Shop A', '2023-09-04', 'Supplier X', 'Milk', 80, 30.0, 2400.0);
  stmt4.run(5, 'Shop B', '2023-09-01', 'Supplier W', 'Juice', 150, 28.0, 4200.0);
  stmt4.run(6, 'Shop B', '2023-09-02', 'Supplier V', 'Chips', 100, 20.0, 2000.0);
  stmt4.run(7, 'Shop B', '2023-09-03', 'Supplier U', 'Cheese', 40, 50.0, 2000.0);
  stmt4.run(8, 'Shop C', '2023-09-05', 'Supplier T', 'Cake', 60, 80.0, 4800.0);
  stmt4.run(9, 'Shop C', '2023-09-06', 'Supplier S', 'Tea', 300, 12.0, 3600.0);
  stmt4.run(10, 'Shop C', '2023-09-07', 'Supplier R', 'Nuts', 120, 70.0, 8400.0);
  stmt4.run(11, 'Shop C', '2023-09-08', 'Supplier Q', 'Yogurt', 100, 35.0, 3500.0);
  stmt4.run(12, 'Shop D', '2023-09-09', 'Supplier P', 'Ice Cream', 50, 60.0, 3000.0);
  stmt4.run(13, 'Shop D', '2023-09-10', 'Supplier O', 'Coffee', 200, 18.0, 3600.0);
  stmt4.run(14, 'Shop D', '2023-09-11', 'Supplier N', 'Popcorn', 180, 25.0, 4500.0);
  stmt4.run(15, 'Shop D', '2023-09-12', 'Supplier M', 'Butter', 90, 45.0, 4050.0);
  stmt4.run(16, 'Shop A', '2023-09-13', 'Supplier L', 'Cookies', 70, 30.0, 2100.0);
  stmt4.run(17, 'Shop B', '2023-09-14', 'Supplier K', 'Water', 400, 4.0, 1600.0);
  stmt4.run(18, 'Shop C', '2023-09-15', 'Supplier J', 'Crackers', 150, 28.0, 4200.0);
  stmt4.run(19, 'Shop D', '2023-09-16', 'Supplier I', 'Cream', 60, 55.0, 3300.0);
  stmt4.run(20, 'Shop A', '2023-09-17', 'Supplier H', 'Candy', 250, 8.0, 2000.0);
  stmt4.finalize();

  console.log('Dummy data inserted.');
});

db.close();

module.exports = dbPath;
