// schema-validator.js
const fs = require('fs');

function validateSchema(schemaPath) {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const raw = fs.readFileSync(schemaPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in schema: ${err.message}`);
  }

  if (!data.database || !Array.isArray(data.database.tables)) {
    throw new Error('Invalid schema: missing "database.tables" array.');
  }

  const validated = {
    name: data.database.name || 'Unknown_DB',
    description: data.database.description || '',
    tables: {}
  };

  for (const t of data.database.tables) {
    if (!t.table_name || !Array.isArray(t.columns)) {
      console.warn(`Skipping invalid table definition: ${JSON.stringify(t)}`);
      continue;
    }

    const lowerName = t.table_name.toLowerCase();
    validated.tables[lowerName] = {
      name: t.table_name,
      columns: t.columns,
      hints: t.hints || {},
      types: {}
    };

    // Auto-infer column types for faster matching
    for (const col of t.columns) {
      const inferred = inferType(col);
      if (inferred) validated.tables[lowerName].types[inferred] = col;
    }
  }

  return validated;
}

// Helper function (column name to type inference)
function inferType(columnName) {
  const lower = columnName.toLowerCase();
  if (lower.includes('date')) return 'date';
  if (lower.includes('amount')) return 'amount';
  if (lower.includes('customer')) return 'customer';
  if (lower.includes('supplier')) return 'supplier';
  if (lower.includes('item')) return 'item';
  if (lower.includes('qty') || lower.includes('quantity')) return 'qty';
  if (lower.includes('rate') || lower.includes('price')) return 'rate';
  if (lower.includes('shop') || lower.includes('store')) return 'shop';
  if (lower.includes('category') || lower.includes('type')) return 'category';
  if (lower.includes('employee')) return 'employee';
  if (lower.includes('department')) return 'department';
  if (lower.includes('salary') || lower.includes('wage')) return 'salary';
  return null;
}

module.exports = validateSchema;
