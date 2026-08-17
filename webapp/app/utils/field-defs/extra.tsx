import type { ColumnDef, Table } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";

/**
 * Checkbox column to visualize selection for DataTables.
 *
 * This is a generic function instead of a const value just to
 * avoid linting errors.
 */
export function checkboxSelectorColumn<T>() {
  return {
    id: "select",
    enableMultiSort: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  } satisfies ColumnDef<T>;
}
