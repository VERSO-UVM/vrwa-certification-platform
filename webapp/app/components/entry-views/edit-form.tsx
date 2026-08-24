import {
  type AccessorFnColumnDef,
  type AccessorKeyColumnDef,
  type ColumnDef,
} from "@tanstack/react-table";
import { FieldSet, FieldGroup, Field } from "~/components/ui/field";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { deepEqual } from "~/utils/utils";
import { Label } from "../ui/label";

/**
 * Generate an edit form using column defs!
 */
export type EditFormProps<T> = {
  item?: T;
  columns: ColumnDef<T, any>[]; // any: see comment in data-table.tsx
  onSave: (updates: Partial<T>) => void;
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
    deepEqual({ ...original, ...updates }, original);

  const [updates, setUpdates] = useState<Partial<T>>({});

  // If item changed from underneath us, reset updates
  // (this method is funky but avoids a useEffect)
  const [prevItem, setPrevItem] = useState(item);
  if (item !== prevItem) {
    setPrevItem(item);
    setUpdates({});
  }

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSave(updates);
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldSet className="pb-2">
        <FieldGroup>
          <Field>
            {columns.map((column) => {
              const accessorKey = (column as AccessorKeyColumnDef<T>)
                ?.accessorKey;
              const accessorFn = (column as AccessorFnColumnDef<T>)?.accessorFn;
              if (!accessorFn && !accessorKey) {
                throw new Error(
                  `Column missing both accessorKey and accessorColumn: ${column}`,
                );
              }
              const val =
                item == null
                  ? undefined
                  : accessorKey
                    ? item?.[accessorKey as keyof T]
                    : accessorFn(item, 0);
              const id = accessorKey.toString() ?? column.id;

              if (!id) throw new Error("Column missing ID");

              if (typeof column.header !== "string") {
                throw new Error(
                  `EditForm: ${column.id}: only string columns supported now`,
                );
              }

              const htmlId = column.id + "_input";
              const Editor = column.meta?.editor;
              if (Editor == null) return null;

              return (
                <div key={id}>
                  <Label htmlFor={htmlId} className="text-sm font-semibold">
                    {column.header}
                  </Label>
                  <Editor
                    // Complete re-mount when value changes
                    key={val == null ? id : val.toString()}
                    value={val}
                    getRow={() => ({ ...item, ...updates })}
                    overrides={{
                      id: htmlId,
                    }}
                    onBlur={(_value) => {}}
                    onChange={(value) =>
                      setUpdates({
                        ...updates,
                        [id]: value,
                      })
                    }
                  />
                </div>
              );
            })}
          </Field>
        </FieldGroup>
        <Button
          disabled={item == null || submitButton.disabledFn(item, updates)}
          {...submitButton.props}
        >
          {submitButton.title}
        </Button>
      </FieldSet>
    </form>
  );
}
