import type { Table } from "@tanstack/react-table";

interface DataTableInfoTextProps<TData> {
  table: Table<TData>;
}

export function DataTableInfoText<TData>({
  table,
}: DataTableInfoTextProps<TData>) {
  const rows = table.getRowModel().rows;
  const totalCount = table.getPreFilteredRowModel().rows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  console.log(totalCount);


  if (rows.length == 0) {
    return <div></div>;
  }

  const first = rows?.at(0)?.index as number;
  const last = rows?.at(-1)?.index as number;

  return (
    <div className="self-center text-muted-foreground text-sm">
      Showing {first + 1} to {last + 1} of {filteredCount} entries
      {totalCount === filteredCount ? null : (
        <span> (filtered from {totalCount} entries)</span>
      )}.
    </div>
  );
}
