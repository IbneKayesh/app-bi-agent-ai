/**
 * Summarize query results
 * @param {Array} rows - Raw results from DB
 * @param {string} intent - SQL intent (optional, for contextual summaries)
 * @returns {Object} - { SQL_Query, Response_Summary, Suggestion }
 */
export function summarizeResult(sql, rows, intent = "") {
  if (!rows || rows.length === 0) {
    return {
      SQL_Query: sql,
      Response_Summary: "No data found for the given query.",
      Suggestion: "Try another item, category, or date range."
    };
  }

  let summaryText = "";
  let suggestionText = "";

  switch (intent) {
    case "salesTotalByCategory":
    case "categoryComparison":
      // Compute total sales
      const totalSales = rows.reduce((sum, row) => sum + row.Total_Sales, 0);
      // Top category
      const topCategory = rows.reduce((prev, curr) =>
        prev.Total_Sales > curr.Total_Sales ? prev : curr
      );
      summaryText = `Total Sales: ${totalSales}. Top category: ${topCategory.Item_Category_Name} (${topCategory.Total_Sales}).`;
      suggestionText = "Compare with previous month or filter by items.";
      break;

    case "itemWiseSales":
      const totalItemSales = rows.reduce((sum, row) => sum + row.Total_Sales, 0);
      summaryText = `Item sales total: ${totalItemSales} for ${rows.map(r => r.Item_Name).join(", ")}.`;
      suggestionText = "Check category-wise totals or last 30 days trend.";
      break;

    case "orderCountComparison":
      const todayOrders = rows[rows.length - 1]?.Total_Orders || 0;
      const yesterdayOrders = rows.length > 1 ? rows[rows.length - 2]?.Total_Orders : 0;
      const growth = yesterdayOrders
        ? (((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(2)
        : "N/A";
      summaryText = `Today's orders: ${todayOrders}, Yesterday: ${yesterdayOrders}, Growth: ${growth}%`;
      suggestionText = "Analyze orders by category or by shop.";
      break;

    case "dateRangeSummary":
      const totalRange = rows[0]?.Total_Sales || 0;
      summaryText = `Total sales for the period: ${totalRange}`;
      suggestionText = "Breakdown by category or item might give more insights.";
      break;

    default:
      summaryText = JSON.stringify(rows);
      suggestionText = "You can compare with other periods or categories.";
      break;
  }

  return {
    SQL_Query: sql,
    Response_Summary: summaryText,
    Suggestion: suggestionText
  };
}
