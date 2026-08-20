import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FieldSet, FieldGroup, Field } from "~/components/ui/field";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { shallowEqual } from "~/utils/utils";
import { Label } from "../ui/label";

/**
 * Generate an edit form using column defs!
 */
export type EditFormProps<T> = {
  item: T|null;
  columns: ColumnDef<T, any>[]; // any: see comment in data-table.tsx
  onSave: (updated: Partial<T>) => void;
  submitButton?: Partial<{
    title: string;
    disabledFn: (original: T, updates: Partial<T>) => boolean;
    props: React.ComponentProps<typeof Button>;
  }>;
};

export function EditForm<T extends object>({
  item,
  columns,
  onSave,
  submitButton = {},
}: EditFormProps<T>) {
  submitButton.title ??= "Save changes";
  submitButton.disabledFn ??= (original, updates) =>
    shallowEqual({ ...original, ...updates }, original);

  const data = useMemo(() => item ? [item] : [], [item]);
  const [updates, setUpdates] = useState<Partial<T>>({});
  // If data is swiped out from under us
  useEffect(() => setUpdates({}), [data]);
  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSave(updates);
  };

  const table = useReactTable<T>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });
  const row = table.getRow("0");
  const headers = table.getFlatHeaders();

  return (
    <form onSubmit={onSubmit}>
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
                  <Label htmlFor={htmlId} className="text-sm font-semibold">
                    {flexRender(
                      cell.column.columnDef.header,
                      header.getContext(),
                    )}
                  </Label>
                  {cell.column.columnDef.meta.editor({
                    value: cell.getContext().getValue(),
                    getRow: () => ({ ...row.original, ...updates }),
                    overrides: {
                      id: htmlId,
                    },
                    onBlur: (_value) => {},
                    onChange: (value) =>
                      setUpdates({
                        ...updates,
                        [cell.column.id]: value,
                      }),
                  })}
                </div>
              );
            })}
          </Field>
        </FieldGroup>
        <Button
          disabled={submitButton.disabledFn(row.original, updates)}
          {...submitButton.props}
        >
          {submitButton.title}
        </Button>
      </FieldSet>
    </form>
  );
}
