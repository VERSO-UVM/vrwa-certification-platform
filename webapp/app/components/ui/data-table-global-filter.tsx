import type { Table } from "@tanstack/react-table";
import { Input } from "./input";
import React from "react";

interface DataTableGlobalFilterProps<TData> {
  table: Table<TData>,
  filterContent: string,
}

export function DataTableGlobalFilter<TData>({
  table,
  filterContent,
}: DataTableGlobalFilterProps<TData>) {
  return (
    <div className="flex items-center pb-1">
      <Input
        placeholder="Filter table..."
        value={filterContent}
        onChange={(event) => table.setGlobalFilter(String(event.target.value))}
        className="max-w-sm border-none"
      />
    </div>
  );
}
