Act as a master of AI automation / Agent development engineer.

Storyline:
I've a to small shop database in MySQL, with Sales, Inventory, Purchase data in Normalization table And connected to transaction app.
A report app build for generating various reports for business analysis. and the report app is connected to a SQLite3 database.
All the data flattened in single table to make report faster and less join in SQLite3.
"Item Master", "Category", "Subcategory", "Brand", "Supplier", "Customer", "Purchase", "Sales", "Inventory", tables are hold all the information as flattened formatted.

What I'll give?
database  schema, table names, column names, column data format in JSON file.

What I want?
An AI agent like talkative chatbot, where user will ask  questions about business reports, and the agent will generate the appropriate SQL queries to fetch the data from the SQLite3 database. The agent should be able to understand natural language queries and translate them into accurate SQL statements that can be executed against the report database. The agent should also be capable of explaining the results in a user-friendly manner, providing insights and summaries based on the data retrieved.

Example?
Q: How many items are currenty active?
A: There are 150 items is currenty active?
Generate SQL in behind: SELECT COUNT(*) as TotalActiveItems
FROM ItemMaster
WHERE IsActive = 1;

Q: Would you please show them category wise?
A: Confectionary 70, Beverage 50, Grocery 30
Generate SQL in behind: SELECT Category, COUNT(*) as ItemCount
FROM ItemMaster
WHERE IsActive = 1
GROUP BY Category
ORDER BY ItemCount DESC;

Q: What is the total sales amount for each customer?
A: SELECT CustomerName, SUM(SalesAmount) as TotalSales
FROM Sales
GROUP BY CustomerName
ORDER BY TotalSales DESC;



Technology:
Frontend will be defined later
Backend NodeJS  with Express, SQLite3 for report database, and a conversational AI agent for natural language processing and SQL generation.

1. User Interface (UI):
    - Web-based interface for users to input natural language queries and view results.
    - Display options for data visualization (charts, tables).
    - Real-time interaction with the AI agent.

2. Backend Server (Node.js + Express):
    - RESTful API endpoints to handle user requests.


3. AI Agent (NLP + SQL Generation):
    - Natural Language Understanding (NLU) module to parse user queries.
    - Query Translation module to convert NLU output into SQL.
    - Result Interpretation module to summarize and explain data. 

The AI Agent should run offline and locally without internet, must be light weight and work without GPU hardware.
Suggest a robust architecture for the AI Agent, including the components and their interactions.