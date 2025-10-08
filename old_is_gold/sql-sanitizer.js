const path = require("path");
const fs = require("fs");

module.exports = function (schemaPath) {
  // Load schema file to build allowed table/column map
  let schema = null;
  try {
    const raw = fs.readFileSync(schemaPath, "utf8");
    schema = JSON.parse(raw);
  } catch (err) {
    console.warn("Could not load schema for sql-sanitizer:", err.message);
    schema = null;
  }

  const tableMap = {};
  if (schema && schema.database && Array.isArray(schema.database.tables)) {
    for (const t of schema.database.tables) {
      tableMap[t.table_name] = Array.isArray(t.columns)
        ? t.columns.slice()
        : [];
    }
  }

  function isValidTable(name) {
    return Object.prototype.hasOwnProperty.call(tableMap, name);
  }

  function isValidColumn(table, col) {
    if (!isValidTable(table)) return false;
    return tableMap[table].includes(col);
  }

  function quoteIdentifier(name) {
    // basic quoting using double quotes; caller must ensure it's a valid table/column
    return '"' + String(name).replace(/"/g, '""') + '"';
  }

  function quoteTable(table) {
    if (!isValidTable(table)) throw new Error(`Table not allowed: ${table}`);
    return quoteIdentifier(table);
  }

  function quoteColumn(table, col) {
    if (!isValidColumn(table, col))
      throw new Error(`Column not allowed: ${col} on ${table}`);
    return quoteIdentifier(col);
  }

  // Simple mapping for keywords to canonical table names (can be extended)
  const keywordToTable = {
    inventory: "Inventory",
    stock: "Inventory",
    item: "Item_Master",
    items: "Item_Master",
    purchase: "Purchase",
    sales: "Sales",
    sale: "Sales",
  };

  function tableForKeyword(keyword) {
    return keywordToTable[keyword];
  }

  return {
    isValidTable,
    isValidColumn,
    quoteTable,
    quoteColumn,
    tableForKeyword,
    tableMap,
  };
};
