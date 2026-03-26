import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

export function DetailsDisplay<TData>({
  item,
  columns,
}: {
  item: TData;
  columns: ColumnDef<TData, any>[];
}) {
  // careful: even wrapping an item into a list makes it an unstable reference
  const data = useMemo(() => [item], [item]);
  const table = useReactTable<TData>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRow("0");
  const headers = table.getFlatHeaders();

  return (
    <>
      <dl className="flex flex-col space-y-2 pb-2">
        {row.getVisibleCells().map((cell) => {
          const header = headers.find((x) => x.column.id == cell.column.id);
          if (header == null) return null;
          return (
            <div key={cell.id}>
              <dt className="text-sm font-semibold">
                {flexRender(cell.column.columnDef.header, header.getContext())}
              </dt>
              <dd>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </dd>
            </div>
          );
        })}
      </dl>
    </>
  );
}
