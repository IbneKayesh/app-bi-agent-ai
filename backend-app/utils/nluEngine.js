import * as chrono from "chrono-node"; // fixed import
import { preprocessQuery } from "./domainClassifier.js";
import fs from "fs";
import path from "path";

// Load schema.json
const schemaPath = path.resolve("./shared/schema.json");
const schemaRaw = fs.readFileSync(schemaPath, "utf-8");
const schema = JSON.parse(schemaRaw);

// Flatten synonyms
const synonymMap = {};
schema.tables.forEach((table) => {
  Object.entries(table.synonyms).forEach(([col, syns]) => {
    syns.forEach((syn) => {
      synonymMap[syn.toLowerCase()] = col;
    });
  });
});

/**
 * Map token to canonical column
 */
export function mapTokenToColumn(token) {
  return synonymMap[token.toLowerCase()] || null;
}

/**
 * Detect entities from query
 */
export function extractEntities(query) {
  const tokens = preprocessQuery(query);

  const items = [];
  const categories = [];
  const numbers = [];
  const dates = [];

  tokens.forEach((token) => {
    const column = mapTokenToColumn(token);

    if (column === "Item_Name") items.push(token);
    if (column === "Item_Category_Name") categories.push(token);

    if (!isNaN(token)) numbers.push(Number(token));
  });

  // Detect dates using chrono-node
  const parsedDates = chrono.parse(query);
  parsedDates.forEach((pd) => {
    if (pd.start) dates.push(pd.start.date());
    if (pd.end) dates.push(pd.end.date());
  });

  return { items, categories, numbers, dates };
}


export function detectIntent(entities, query) {
  if (entities.categories.length > 0 && query.toLowerCase().includes("total"))
    return "salesTotalByCategory";
  if (entities.items.length > 0)
    return "itemWiseSales";
  if (query.toLowerCase().includes("compare"))
    return "categoryComparison";
  if (query.toLowerCase().includes("orders"))
    return "orderCountComparison";
  if (query.toLowerCase().includes("summary"))
    return "dateRangeSummary";
  if (query.toLowerCase().includes("sales"))
    return "itemWiseSales";

  return null;
}