import fs from "fs";
import path from "path";
import { eng as englishStopwords } from "stopword"; // <--- fixed

// Load schema.json
const schemaPath = path.resolve("./shared/schema.json");
const schemaRaw = fs.readFileSync(schemaPath, "utf-8");
const schema = JSON.parse(schemaRaw);

// Flatten all synonyms for easy matching
const synonymMap = {};
schema.tables.forEach((table) => {
  Object.entries(table.synonyms).forEach(([col, syns]) => {
    syns.forEach((syn) => {
      synonymMap[syn.toLowerCase()] = col;
    });
  });
});


//for offline
const englishStopwords_test = [
  "a","an","the","and","or","but","if","then","else","of","at","by","for","with",
  "about","against","between","into","through","during","before","after","above",
  "below","to","from","up","down","in","out","on","off","over","under","again",
  "further","then","once"
];

// Stopword set
const stopwordSet = new Set(englishStopwords);

/**
 * Preprocess query
 * - Lowercase
 * - Remove punctuation
 * - Remove stopwords
 */
export function preprocessQuery(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter((word) => word && !stopwordSet.has(word));
}

/**
 * Domain classifier
 * Returns matched column names from schema.json
 */
export function classifyDomain(query) {
  const tokens = preprocessQuery(query);

  console.log("Query Tokens:", tokens);

  const matchedColumns = new Set();

  tokens.forEach((token) => {
    if (synonymMap[token]) {
      matchedColumns.add(synonymMap[token]);
    }
  });

  return Array.from(matchedColumns);
}

/**
 * Checks if query is relevant to Table_Sales
 */
export function isQueryRelevant(query) {
  const matchedCols = classifyDomain(query);

  console.log("Matched Columns:", matchedCols);

  return matchedCols.length > 0;
}
