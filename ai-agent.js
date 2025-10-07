const { NlpManager } = require('node-nlp');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'reports.db');
const sanitizer = require('./sql-sanitizer');

class AIAgent {
  constructor() {
    this.manager = new NlpManager({ languages: ['en'] });
    this.lastIntent = null;
    this.lastEntities = [];
    this.lastResults = [];
    this.lastSQL = null;
    this._ready = false;
  }

  async init() {
    // init and train model (or load if persisted)
    await this.trainModel();
    this._ready = true;
  }

  isReady() {
    return this._ready;
  }

  async trainModel() {
    // Add intents and examples
    this.manager.addDocument('en', 'how many items are active', 'count_items');
    this.manager.addDocument('en', 'count items', 'count_items');
    this.manager.addDocument('en', 'show items by category', 'group_by_category');
    this.manager.addDocument('en', 'category wise items', 'group_by_category');
    this.manager.addDocument('en', 'total sales by customer', 'total_sales_customer');
    this.manager.addDocument('en', 'sales amount for each customer', 'total_sales_customer');
    this.manager.addDocument('en', 'what is the total inventory', 'total_inventory');
    this.manager.addDocument('en', 'total stock', 'total_inventory');
    this.manager.addDocument('en', 'show sales by date', 'sales_by_date');
    this.manager.addDocument('en', 'sales over time', 'sales_by_date');
    this.manager.addDocument('en', 'list all items', 'list_items');
    this.manager.addDocument('en', 'list all iteitem names', 'list_items');
    this.manager.addDocument('en', 'show all products', 'list_items');
    this.manager.addDocument('en', 'total purchases by supplier', 'total_purchases');
    this.manager.addDocument('en', 'purchases from suppliers', 'total_purchases');

    // New intents for chaining
    this.manager.addDocument('en', 'more details', 'more_details');
    this.manager.addDocument('en', 'show more', 'more_details');
    this.manager.addDocument('en', 'filter by category', 'filter_category');
    this.manager.addDocument('en', 'only for electronics', 'filter_category');

    // New intents for complex joins
    this.manager.addDocument('en', 'sales by category', 'sales_by_category');
    this.manager.addDocument('en', 'total sales per category', 'sales_by_category');

    // New intents for custom aggregations
    this.manager.addDocument('en', 'average sales', 'avg_sales');
    this.manager.addDocument('en', 'mean sales amount', 'avg_sales');
    this.manager.addDocument('en', 'total sales', 'sum_sales');
    this.manager.addDocument('en', 'sum of all sales', 'sum_sales');

    // Add answers
    this.manager.addAnswer('en', 'count_items', 'Counting items...');
    this.manager.addAnswer('en', 'group_by_category', 'Grouping by category...');
    this.manager.addAnswer('en', 'total_sales_customer', 'Calculating total sales...');
    this.manager.addAnswer('en', 'total_inventory', 'Calculating total inventory...');
    this.manager.addAnswer('en', 'sales_by_date', 'Showing sales by date...');
    this.manager.addAnswer('en', 'list_items', 'Listing all items...');
    this.manager.addAnswer('en', 'total_purchases', 'Calculating total purchases...');
    this.manager.addAnswer('en', 'more_details', 'Fetching more details...');
    this.manager.addAnswer('en', 'filter_category', 'Filtering by category...');
    this.manager.addAnswer('en', 'sales_by_category', 'Calculating sales by category...');
    this.manager.addAnswer('en', 'avg_sales', 'Calculating average sales...');
    this.manager.addAnswer('en', 'sum_sales', 'Summing sales...');

    await this.manager.train();
    console.log('NLP model trained.');
  }

  async processQuery(query) {
    const response = await this.manager.process('en', query);
    //console.log('NLP Response:', JSON.stringify(response, null, 2));


    const intent = response.intent;
    const entities = response.entities;

    let sql = '';
    let params = [];
    let result = '';

    // Handle chaining
    if (intent === 'more_details') {
      if (this.lastSQL) {
        sql = this.lastSQL.replace(/SELECT [^F]* FROM/, 'SELECT * FROM');
      } else {
        return 'No previous query to show more details for.';
      }
    } else if (intent === 'filter_category') {
      // Extract category from query (simple way)
      const category = query.toLowerCase().match(/confectionary|beverage|snacks|dairy/)?.[0] || 'Confectionary'; // default based on schema
      if (this.lastSQL) {
        try {
          // ensure category column exists in lastSQL context; if not, fall back
          sql = this.lastSQL + ` WHERE "Category_Name" = ?`;
        } catch (err) {
          console.warn('Could not apply filter_category safely:', err.message);
          sql = `SELECT * FROM "Item_Master" WHERE "Category_Name" = ? LIMIT 100`;
        }
        params = [category];
      } else {
        return 'No previous query to filter.';
      }
    } else {
      // Generate SQL dynamically
      sql = this.generateSQL(query);
    }

  this.lastSQL = sql;

  console.log('Generated SQL:', sql, 'Params:', params);

  // Execute SQL via helper
  const db = new sqlite3.Database(dbPath);
  const rows = await this.runQuery(db, sql, params);
  db.close();

    // Update context
    this.lastIntent = intent;
    this.lastEntities = entities;
    this.lastResults = rows;

    // Interpret results into structured output
    const summary = this.interpretResults(intent, rows);

    return {
      sql,
      params,
      intent,
      entities,
      rows,
      summary,
    };
  }

  runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  interpretResults(intent, rows) {
    switch (intent) {
      case 'count_items':
        return `There are ${rows[0].TotalItems} items.`;
      case 'group_by_category':
        let msg = 'Items by category:\n';
        rows.forEach(row => {
          msg += `${row['Category_Name']}: ${row.ItemCount}\n`;
        });
        return msg;
      case 'total_sales_customer':
        let msg2 = 'Total sales by customer:\n';
        rows.forEach(row => {
          msg2 += `${row['Customer_Name']}: ${row.TotalSales}\n`;
        });
        return msg2;
      case 'total_inventory':
        return `Total inventory stock is ${rows[0].TotalStock} units.`;
      case 'sales_by_date':
        let msg3 = 'Sales by date:\n';
        rows.forEach(row => {
          msg3 += `${row['Sales_Date']}: ${row.TotalSales}\n`;
        });
        return msg3;
      case 'list_items':
        let msg4 = 'All items:\n';
        rows.forEach(row => {
          msg4 += `${row['Item_Name']} (${row['Category_Name']}): ${row['Sales_Rate']}\n`;
        });
        return msg4;
      case 'total_purchases':
        let msg5 = 'Total purchases by supplier:\n';
        rows.forEach(row => {
          msg5 += `${row['Supplier_Name']}: ${row.TotalPurchases}\n`;
        });
        return msg5;
      case 'more_details':
        let msg6 = 'Detailed items:\n';
        rows.forEach(row => {
          msg6 += JSON.stringify(row) + '\n';
        });
        return msg6;
      case 'filter_category':
        let msg7 = 'Filtered items:\n';
        rows.forEach(row => {
          msg7 += `${row['Item_Name']} (${row['Category_Name']}): ${row['Sales_Rate']}\n`;
        });
        return msg7;
      case 'sales_by_category':
        let msg8 = 'Sales by category:\n';
        rows.forEach(row => {
          msg8 += `${row['Category_Name']}: ${row.TotalSales}\n`;
        });
        return msg8;
      case 'avg_sales':
        return `Average sales amount is ${rows[0].AvgSales}.`;
      case 'sum_sales':
        return `Total sales amount is ${rows[0].TotalSales}.`;
      default:
        return 'Results processed.';
    }
  }

  generateSQL(query) {
    const lower = query.toLowerCase();
    let table = 'Sales';
    if (lower.includes('inventory') || lower.includes('stock')) table = 'Inventory';
    if (lower.includes('item')) table = 'Item_Master';
    if (lower.includes('purchase')) table = 'Purchase';

    let sql = '';

    if (lower.includes('count')) {
      try {
        sql = `SELECT COUNT(*) as TotalItems FROM ${sanitizer.quoteTable(table)}`;
      } catch (err) {
        console.warn('Invalid table for count, falling back to Item_Master:', err.message);
        sql = `SELECT COUNT(*) as TotalItems FROM "Item_Master"`;
      }
    } else if (lower.includes('average') || lower.includes('avg')) {
      let column = 'Sales_Amount';
      if (table === 'Inventory') column = 'Stock_Qty';
      try {
        sql = `SELECT AVG(${sanitizer.quoteColumn(table, column)}) as AvgSales FROM ${sanitizer.quoteTable(table)}`;
      } catch (err) {
        console.warn('Invalid table/column for avg, falling back:', err.message);
        sql = `SELECT AVG("Sales_Amount") as AvgSales FROM "Sales"`;
      }
    } else if (lower.includes('sum') || lower.includes('total')) {
      let column = 'Sales_Amount';
      if (table === 'Inventory') column = 'Stock_Qty';
      if (table === 'Purchase') column = 'Purchase_Amount';
      let group = '';
      if (lower.includes('by customer')) group = 'GROUP BY "Customer_Name"';
      if (lower.includes('by category')) {
        if (table === 'Sales') {
          try {
            sql = `SELECT im."Category_Name", SUM(s.${sanitizer.quoteColumn('Sales', column)}) as TotalSales FROM ${sanitizer.quoteTable('Sales')} s JOIN ${sanitizer.quoteTable('Item_Master')} im ON s."Item_Name" = im."Item_Name" GROUP BY im."Category_Name" ORDER BY TotalSales DESC`;
          } catch (err) {
            console.warn('Invalid mapping for sales by category, falling back:', err.message);
            sql = `SELECT im."Category_Name", SUM(s."Sales_Amount") as TotalSales FROM "Sales" s JOIN "Item_Master" im ON s."Item_Name" = im."Item_Name" GROUP BY im."Category_Name" ORDER BY TotalSales DESC`;
          }
        } else {
          group = 'GROUP BY "Category_Name"';
        }
      }
      if (lower.includes('by date')) group = 'GROUP BY "Sales_Date"';
      if (lower.includes('by supplier')) group = 'GROUP BY "Supplier_Name"';
      if (!sql) {
        try {
          sql = `SELECT SUM(${sanitizer.quoteColumn(table, column)}) as TotalSales FROM ${sanitizer.quoteTable(table)} ${group}`;
        } catch (err) {
          console.warn('Invalid table/column for sum, falling back:', err.message);
          sql = `SELECT SUM("Sales_Amount") as TotalSales FROM "Sales"`;
        }
      }
    } else if (lower.includes('list') || lower.includes('show')) {
      try {
        sql = `SELECT ${sanitizer.quoteColumn(table, 'Item_Name')}, ${sanitizer.quoteColumn(table, 'Category_Name')}, ${sanitizer.quoteColumn(table, 'Sales_Rate')} FROM ${sanitizer.quoteTable(table)} ORDER BY ${sanitizer.quoteColumn(table, 'Category_Name')}`;
      } catch (err) {
        console.warn('Invalid table/columns for list/show, falling back:', err.message);
        sql = `SELECT "Item_Name", "Category_Name", "Sales_Rate" FROM "Item_Master" ORDER BY "Category_Name"`;
      }
    } else {
      try {
        sql = `SELECT * FROM ${sanitizer.quoteTable(table)} LIMIT 10`; // default
      } catch (err) {
        console.warn('Invalid default table, falling back to Item_Master:', err.message);
        sql = `SELECT * FROM "Item_Master" LIMIT 10`;
      }
    }

    return sql;
  }
}

module.exports = AIAgent;
