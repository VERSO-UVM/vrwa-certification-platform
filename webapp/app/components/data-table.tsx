import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type TableOptions,
  type Table as ReactTable,
  type RowData,
} from "@tanstack/react-table";

import { DataTableBody } from "./data-table/body";
import { DataTableGlobalFilter } from "./data-table/global-filter";
import { DataTableHeader } from "./data-table/header";
import {
  DataTablePageSizeSelect,
  PAGE_SIZE_SHOW_ALL,
  type PageSizeValues,
} from "./data-table/page-size-select";
import { DataTablePagination } from "./data-table/pagination";
import { Table } from "~/components/ui/table";
import { DataTableInfoText } from "./data-table/info-text";

export type DataTableDecorationProps<TData> = {
  table: ReactTable<TData>;
};

/* We can define values to go in the `meta` field of table options */
declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    pageSizeOptions: PageSizeValues[];
    _?: undefined & TData; /* ignore unused warning */
  }
}

export interface DataTableProps<TData> {
  data: TData[],
  // Defining the ColumnDefs using `createColumnHelper` makes them more typesafe,
  // but we're then forced to an `any` in TValue when passing them around...
  // Reference: https://github.com/TanStack/table/issues/4382
  // ColumnDef<TData, any> is the same as the type used in useReactTable props
  columns: ColumnDef<TData, any>[],

  pageSizeValues?: PageSizeValues[];
  topDecorations?: React.ComponentType<DataTableDecorationProps<TData>>[];
  bottomDecorations?: React.ComponentType<DataTableDecorationProps<TData>>[];

  table?: Partial<TableOptions<TData>>,
}

export function DataTable<TData>({
  data,
  columns,
  pageSizeValues = [
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "25", value: 25 },
    { label: "50", value: 50 },
    PAGE_SIZE_SHOW_ALL,
  ],
  topDecorations = [ DataTableGlobalFilter, DataTablePageSizeSelect ],
  bottomDecorations = [ DataTablePagination, DataTableInfoText ],
  table: tableOptions,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    globalFilterFn: "includesString",
    enableMultiRowSelection: false,
    defaultColumn: {
      cell: ({ getValue }) => getValue() ?? "-",
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
        ...tableOptions?.initialState?.pagination,
      },
      ...tableOptions?.initialState,
    },
    meta: {
      pageSizeOptions: pageSizeValues,
      ...tableOptions?.meta,
    },
    ...tableOptions
  });

  return (
    <div>
      <div className="flex place-content-between">
        {topDecorations.map((Item, i) => (
          <Item key={i} table={table} />
        ))}
      </div>

      <div className="rounded-md">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody table={table} />
        </Table>
      </div>

      <div className="flex flex-wrap place-content-between">
        {bottomDecorations.map((Item, i) => (
          <Item key={i} table={table} />
        ))}
      </div>
    </div>
  );
}
