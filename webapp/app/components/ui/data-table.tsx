/**
 * See https://ui.shadcn.com/docs/components/base/data-table#datatable--component
 */

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import { DataTableBody } from "./data-table-body";
import { DataTableGlobalFilter } from "./data-table-global-filter";
import { DataTableHeader } from "./data-table-header";
import { DataTablePageSizeSelect } from "./data-table-page-size-select";
import { DataTablePagination } from "./data-table-pagination";
import { Table } from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showGlobalFilter?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showGlobalFilter = true,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    defaultColumn: {
      cell: ({ getValue }) => getValue() ?? "-",
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div>
      {showGlobalFilter ? <DataTableGlobalFilter table={table} /> : null}

      <div className="overflow-hidden rounded-md">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody table={table}/>
        </Table>
      </div>

      <div className="flex flex-wrap place-content-between">
        <div>
          <DataTablePagination table={table} />
        </div>
        <div>
          <DataTablePageSizeSelect table={table} />
        </div>
      </div>
    </div>
  );
}
