import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FieldSet, FieldGroup, FieldLabel, Field } from "./ui/field";
import { Input } from "./ui/input";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { DrawerClose } from "./ui/drawer";
import { shallowEqual } from "~/utils/utils";

export type EditFormProps<T> = {
  item: T;
  columns: ColumnDef<T, any>[];
  onSave: (updated: Partial<T>) => void;
};
export function EditForm<T extends object>({
  item,
  columns,
  onSave,
}: EditFormProps<T>) {
  const data = useMemo(() => [item], [item]);
  const [updates, setUpdates] = useState<Partial<T>>({});
  // If data is swiped out from under us
  useEffect(() => setUpdates({}), [data]);

  const table = useReactTable<T>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRow("0");
  const headers = table.getFlatHeaders();

  return (
    <FieldSet className="pb-2">
      <FieldGroup>
        <Field>
          {row.getVisibleCells().map((cell) => {
            const header = headers.find((x) => x.column.id == cell.column.id);
            if (header == null) return null;
            if (cell.column.columnDef.meta?.editor == null) return null;
            const htmlId = cell.column.id + "_input";
            return (
              <div key={cell.id}>
                <dt className="text-sm font-semibold">
                  {flexRender(
                    cell.column.columnDef.header,
                    header.getContext(),
                  )}
                </dt>
                <dd>
                  {cell.column.columnDef.meta.editor({
                    ctx: cell.getContext(),
                    forId: htmlId,
                    onBlur: (_value) => {},
                    onChange: (value) =>
                      setUpdates({
                        ...updates,
                        [cell.column.id]: value,
                      }),
                  })}
                </dd>
              </div>
            );
          })}
        </Field>
      </FieldGroup>
      <Button
        disabled={shallowEqual({ ...row.original, ...updates }, row.original)}
        onClick={() => onSave(updates)}
      >
        Save changes
      </Button>
    </FieldSet>
  );
}
