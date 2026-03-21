import { flexRender, type Table } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "./table";
import { Button } from "./button";
import { ArrowDownZA, ArrowUpAZ, ArrowUpDown } from "lucide-react";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  return (
    <TableHeader className="sticky background top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <TableHead key={header.id}>
                <Button
                  variant="ghost"
                  onClick={() =>
                    header.column.toggleSorting(
                      header.column.getIsSorted() == "asc",
                    )
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  <SortIcon sorted={header.column.getIsSorted()} />
                </Button>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

function SortIcon({ sorted }: { sorted: "asc" | "desc" | false }) {
  switch (sorted) {
    case false:
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;

    case "desc":
      return <ArrowDownZA className="h-4 w-4" />;

    case "asc":
      return <ArrowUpAZ className="h-4 w-4" />;
  }
}
