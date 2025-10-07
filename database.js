const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Path to the database file
const dbPath = path.join(__dirname, "reports.db");

// Remove old database file if exists (optional - for fresh start)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Create and open the database
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Item_Master
  db.run(`CREATE TABLE IF NOT EXISTS Item_Master (
    Item_Id INTEGER PRIMARY KEY,
    Category_Name TEXT,
    Item_Name TEXT,
    Sales_Rate REAL,
    Purchase_Rate REAL,
    Unit TEXT
  )`);

  const itemStmt = db.prepare(
    `INSERT INTO Item_Master VALUES (?, ?, ?, ?, ?, ?)`
  );
  const itemData = [
    [1, "Beverage", "Coke", 20, 15, "Bottle"],
    [2, "Snacks", "Chips", 25, 18, "Packet"],
    [3, "Dairy", "Milk", 30, 25, "Liter"],
    [4, "Confectionery", "Chocolate", 50, 40, "Bar"],
    [5, "Beverage", "Juice", 35, 28, "Bottle"],
    [6, "Snacks", "Nuts", 60, 50, "Packet"],
    [7, "Dairy", "Cheese", 70, 55, "Block"],
    [8, "Confectionery", "Candy", 10, 5, "Piece"],
    [9, "Snacks", "Biscuits", 15, 10, "Packet"],
    [10, "Dairy", "Butter", 55, 45, "Pack"],
  ];
  itemData.forEach((row) => itemStmt.run(row));
  itemStmt.finalize();

  // 2. Inventory
  db.run(`CREATE TABLE IF NOT EXISTS Inventory (
    Inventory_Id INTEGER PRIMARY KEY,
    Shop_Name TEXT,
    Item_Id INTEGER,
    Item_Name TEXT,
    Stock_Qty INTEGER,
    Reorder_Level INTEGER,
    Last_Updated TEXT
  )`);

  const invStmt = db.prepare(
    `INSERT INTO Inventory VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const inventoryData = [
    [1, "Main Shop", 1, "Coke", 100, 20, "2025-10-01"],
    [2, "Main Shop", 2, "Chips", 80, 15, "2025-10-02"],
    [3, "Main Shop", 3, "Milk", 50, 10, "2025-10-01"],
    [4, "Main Shop", 4, "Chocolate", 40, 10, "2025-10-03"],
    [5, "Main Shop", 5, "Juice", 70, 20, "2025-10-04"],
    [6, "Main Shop", 6, "Nuts", 30, 10, "2025-10-02"],
    [7, "Main Shop", 7, "Cheese", 60, 15, "2025-10-03"],
    [8, "Main Shop", 8, "Candy", 90, 30, "2025-10-04"],
    [9, "Main Shop", 9, "Biscuits", 120, 40, "2025-10-05"],
    [10, "Main Shop", 10, "Butter", 45, 10, "2025-10-06"],
  ];
  inventoryData.forEach((row) => invStmt.run(row));
  invStmt.finalize();

  // 3. Sales
  db.run(`CREATE TABLE IF NOT EXISTS Sales (
    Sales_Id INTEGER PRIMARY KEY,
    Shop_Name TEXT,
    Sales_Date TEXT,
    Customer_Name TEXT,
    Item_Id INTEGER,
    Item_Name TEXT,
    Sales_Qty INTEGER,
    Sales_Rate REAL,
    Sales_Amount REAL,
    Payment_Mode TEXT,
    Invoice_No TEXT
  )`);

  const salesStmt = db.prepare(
    `INSERT INTO Sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const salesData = [
    [
      1,
      "Main Shop",
      "2025-10-01",
      "John Doe",
      1,
      "Coke",
      2,
      20,
      40,
      "Cash",
      "INV001",
    ],
    [
      2,
      "Main Shop",
      "2025-10-02",
      "Jane Smith",
      2,
      "Chips",
      3,
      25,
      75,
      "Card",
      "INV002",
    ],
    [
      3,
      "Main Shop",
      "2025-10-02",
      "Alice",
      3,
      "Milk",
      1,
      30,
      30,
      "Cash",
      "INV003",
    ],
    [
      4,
      "Main Shop",
      "2025-10-03",
      "Bob",
      4,
      "Chocolate",
      2,
      50,
      100,
      "Cash",
      "INV004",
    ],
    [
      5,
      "Main Shop",
      "2025-10-03",
      "Carol",
      5,
      "Juice",
      1,
      35,
      35,
      "Card",
      "INV005",
    ],
    [
      6,
      "Main Shop",
      "2025-10-04",
      "David",
      6,
      "Nuts",
      1,
      60,
      60,
      "UPI",
      "INV006",
    ],
    [
      7,
      "Main Shop",
      "2025-10-04",
      "Eve",
      7,
      "Cheese",
      2,
      70,
      140,
      "Cash",
      "INV007",
    ],
    [
      8,
      "Main Shop",
      "2025-10-05",
      "Frank",
      8,
      "Candy",
      5,
      10,
      50,
      "UPI",
      "INV008",
    ],
    [
      9,
      "Main Shop",
      "2025-10-05",
      "Grace",
      9,
      "Biscuits",
      3,
      15,
      45,
      "Card",
      "INV009",
    ],
    [
      10,
      "Main Shop",
      "2025-10-06",
      "Heidi",
      10,
      "Butter",
      1,
      55,
      55,
      "Cash",
      "INV010",
    ],
  ];
  salesData.forEach((row) => salesStmt.run(row));
  salesStmt.finalize();

  // 4. Purchase
  db.run(`CREATE TABLE IF NOT EXISTS Purchase (
    Purchase_Id INTEGER PRIMARY KEY,
    Shop_Name TEXT,
    Purchase_Date TEXT,
    Supplier_Name TEXT,
    Item_Id INTEGER,
    Item_Name TEXT,
    Purchase_Qty INTEGER,
    Purchase_Rate REAL,
    Purchase_Amount REAL,
    Invoice_No TEXT
  )`);

  const purchaseStmt = db.prepare(
    `INSERT INTO Purchase VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const purchaseData = [
    [
      1,
      "Main Shop",
      "2025-09-25",
      "FreshBev Ltd",
      1,
      "Coke",
      50,
      15,
      750,
      "PINV001",
    ],
    [
      2,
      "Main Shop",
      "2025-09-25",
      "SnackMart",
      2,
      "Chips",
      100,
      18,
      1800,
      "PINV002",
    ],
    [
      3,
      "Main Shop",
      "2025-09-26",
      "DairyBest",
      3,
      "Milk",
      60,
      25,
      1500,
      "PINV003",
    ],
    [
      4,
      "Main Shop",
      "2025-09-26",
      "Sweet Treats",
      4,
      "Chocolate",
      40,
      40,
      1600,
      "PINV004",
    ],
    [
      5,
      "Main Shop",
      "2025-09-27",
      "FreshBev Ltd",
      5,
      "Juice",
      70,
      28,
      1960,
      "PINV005",
    ],
    [
      6,
      "Main Shop",
      "2025-09-27",
      "NuttyWorld",
      6,
      "Nuts",
      30,
      50,
      1500,
      "PINV006",
    ],
    [
      7,
      "Main Shop",
      "2025-09-28",
      "DairyBest",
      7,
      "Cheese",
      60,
      55,
      3300,
      "PINV007",
    ],
    [
      8,
      "Main Shop",
      "2025-09-28",
      "Sweet Treats",
      8,
      "Candy",
      100,
      5,
      500,
      "PINV008",
    ],
    [
      9,
      "Main Shop",
      "2025-09-29",
      "SnackMart",
      9,
      "Biscuits",
      120,
      10,
      1200,
      "PINV009",
    ],
    [
      10,
      "Main Shop",
      "2025-09-29",
      "DairyBest",
      10,
      "Butter",
      45,
      45,
      2025,
      "PINV010",
    ],
  ];
  purchaseData.forEach((row) => purchaseStmt.run(row));
  purchaseStmt.finalize();

  // 5. Customer_Master
  db.run(`CREATE TABLE IF NOT EXISTS Customer_Master (
    Customer_Id INTEGER PRIMARY KEY,
    Customer_Name TEXT,
    Address TEXT,
    Phone TEXT,
    Email TEXT
  )`);

  const custStmt = db.prepare(
    `INSERT INTO Customer_Master VALUES (?, ?, ?, ?, ?)`
  );
  const customers = [
    [1, "John Doe", "123 Market St", "9876543210", "john@example.com"],
    [2, "Jane Smith", "456 Lake Rd", "9876543211", "jane@example.com"],
    [3, "Alice", "789 Hill St", "9876543212", "alice@example.com"],
    [4, "Bob", "321 River Ln", "9876543213", "bob@example.com"],
    [5, "Carol", "654 Park Ave", "9876543214", "carol@example.com"],
    [6, "David", "987 Forest Dr", "9876543215", "david@example.com"],
    [7, "Eve", "246 Beach Blvd", "9876543216", "eve@example.com"],
    [8, "Frank", "135 Sunset Blvd", "9876543217", "frank@example.com"],
    [9, "Grace", "864 Sunrise Rd", "9876543218", "grace@example.com"],
    [10, "Heidi", "975 Moonlight Ln", "9876543219", "heidi@example.com"],
  ];
  customers.forEach((row) => custStmt.run(row));
  custStmt.finalize();

  // 6. Supplier_Master
  db.run(`CREATE TABLE IF NOT EXISTS Supplier_Master (
    Supplier_Id INTEGER PRIMARY KEY,
    Supplier_Name TEXT,
    Contact_Person TEXT,
    Phone TEXT,
    Email TEXT
  )`);

  const supplierStmt = db.prepare(
    `INSERT INTO Supplier_Master VALUES (?, ?, ?, ?, ?)`
  );
  const suppliers = [
    [1, "FreshBev Ltd", "Tom", "9123456780", "contact@freshbev.com"],
    [2, "SnackMart", "Jerry", "9123456781", "sales@snackmart.com"],
    [3, "DairyBest", "Alice", "9123456782", "info@dairybest.com"],
    [4, "Sweet Treats", "Bob", "9123456783", "orders@sweettreats.com"],
    [5, "NuttyWorld", "Carol", "9123456784", "service@nuttyworld.com"],
    [6, "ChocoHeaven", "Eve", "9123456785", "contact@chocoheaven.com"],
    [7, "JuiceJoy", "Frank", "9123456786", "sales@juicejoy.com"],
    [8, "CoolDairy", "Grace", "9123456787", "cool@dairy.com"],
    [9, "QuickSuppliers", "Heidi", "9123456788", "support@quicksup.com"],
    [10, "MegaVendors", "Ivan", "9123456789", "hello@megavendors.com"],
  ];
  suppliers.forEach((row) => supplierStmt.run(row));
  supplierStmt.finalize();

  console.log("Database created and dummy data inserted.");
});

db.close();

module.exports = dbPath;
