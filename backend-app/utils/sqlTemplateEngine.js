import { extractEntities } from "./nluEngine.js";
import Fuse from "fuse.js";

// Example SQL templates
const templates = {
  salesTotalByCategory: `
    SELECT Item_Category_Name, SUM(Item_Qty * Item_Rate) AS Total_Sales
    FROM Table_Sales
    WHERE strftime('%Y-%m', Order_Date) = strftime('%Y-%m', @targetMonth)
    GROUP BY Item_Category_Name;
  `,
  itemWiseSales: `
    SELECT Item_Name, SUM(Item_Qty * Item_Rate) AS Total_Sales
    FROM Table_Sales
    WHERE Item_Name = @itemName
    GROUP BY Item_Name;
  `,
  categoryComparison: `
    SELECT Item_Category_Name, SUM(Item_Qty * Item_Rate) AS Total_Sales
    FROM Table_Sales
    WHERE Order_Date BETWEEN @startDate AND @endDate
    GROUP BY Item_Category_Name;
  `,
  orderCountComparison: `
    SELECT date(Order_Date) AS Order_Date, COUNT(DISTINCT Order_No) AS Total_Orders
    FROM Table_Sales
    WHERE Order_Date BETWEEN @startDate AND @endDate
    GROUP BY date(Order_Date);
  `,
  dateRangeSummary: `
    SELECT SUM(Item_Qty * Item_Rate) AS Total_Sales
    FROM Table_Sales
    WHERE Order_Date BETWEEN @startDate AND @endDate;
  `
};

// RAG-like: past queries retrieval
let pastQueries = []; // Populate from agent_training.db later
const fuse = new Fuse(pastQueries, { keys: ["user_query", "generated_sql"], threshold: 0.4 });

/**
 * Generate SQL + parameters
 */
export function generateSQL(intent, entities) {
  let sql = "";
  const params = {};

  switch (intent) {
    case "salesTotalByCategory":
      sql = templates.salesTotalByCategory;
      params["@targetMonth"] = entities.dates[0]
        ? entities.dates[0].toISOString().slice(0, 7)
        : new Date().toISOString().slice(0, 7);
      break;

    case "itemWiseSales":
      if (!entities.items || entities.items.length === 0)
        throw new Error("No item found for item-wise sales");
      sql = templates.itemWiseSales;
      params["@itemName"] = entities.items.join(" ");
      break;

    case "categoryComparison":
      if (!entities.dates || entities.dates.length < 2)
        throw new Error("Need start and end dates for category comparison");
      sql = templates.categoryComparison;
      params["@startDate"] = entities.dates[0].toISOString().slice(0, 10);
      params["@endDate"] = entities.dates[1].toISOString().slice(0, 10);
      break;

    case "orderCountComparison":
      if (!entities.dates || entities.dates.length < 2)
        throw new Error("Need start and end dates for order count comparison");
      sql = templates.orderCountComparison;
      params["@startDate"] = entities.dates[0].toISOString().slice(0, 10);
      params["@endDate"] = entities.dates[1].toISOString().slice(0, 10);
      break;

    case "dateRangeSummary":
      if (!entities.dates || entities.dates.length < 2)
        throw new Error("Need start and end dates for summary");
      sql = templates.dateRangeSummary;
      params["@startDate"] = entities.dates[0].toISOString().slice(0, 10);
      params["@endDate"] = entities.dates[1].toISOString().slice(0, 10);
      break;

    default:
      throw new Error("Intent not recognized");
  }

  return { sql, params };
}

/**
 * Retrieve similar past queries (RAG)
 */
export function retrieveSimilarQueries(userQuery, limit = 3) {
  if (!pastQueries.length) return [];
  return fuse
    .search(userQuery)
    .slice(0, limit)
    .map((r) => r.item);
}
