// src/components/DataTableDisplay.jsx
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function DataTableDisplay({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <DataTable value={data} className="p-mt-2">
      {Object.keys(data[0]).map((col) => (
        <Column key={col} field={col} header={col} />
      ))}
    </DataTable>
  );
}
