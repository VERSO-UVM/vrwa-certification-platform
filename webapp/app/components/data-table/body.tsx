import { flexRender, type Table } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "~/components/ui/table";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
}

export function DataTableBody<TData>({ table }: DataTableBodyProps<TData>) {
  if (!table.getRowModel().rows.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={table.getAllColumns().length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() ? "selected" : null}
          onClick={row.getToggleSelectedHandler()}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
