import type { RowData } from "@tanstack/react-table";
import type { ColumnEditor } from "./editors";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    editor?: ColumnEditor<TData, TValue>;
  }
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    _?: undefined & TData; /* ignore unused warning */
  }
}
