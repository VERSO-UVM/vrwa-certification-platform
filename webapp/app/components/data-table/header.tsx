import { flexRender, type Table } from "@tanstack/react-table";
import { ArrowDownZA, ArrowUpAZ, ArrowUpDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  return (
    // Fix header at top while scrolling!
    // TODO: Fix header color so it's the same base color as the rest of the card
    <TableHeader className="sticky vrwa-light:bg-gray-300/40 dark: bg-gray-900 top-0 z-10">
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
      return <ArrowUpDown className="h-4 w-4 text-gray-500" />;

    case "desc":
      return <ArrowDownZA className="h-4 w-4" />;

    case "asc":
      return <ArrowUpAZ className="h-4 w-4" />;
  }
}
