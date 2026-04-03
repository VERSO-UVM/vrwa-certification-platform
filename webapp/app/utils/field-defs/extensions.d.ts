/**
 * These extensions are for the values that go in react-table's "meta"
 * fields in ColumnDef and table options respectively.
 */

import type { RowData } from "@tanstack/react-table";
import type { FieldEditor } from "../field-editors";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    editor?: FieldEditor<TData, TValue>;
  }
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    _?: undefined & TData; /* ignore unused warning */
  }
}
