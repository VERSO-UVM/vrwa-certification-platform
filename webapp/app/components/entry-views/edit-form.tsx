import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FieldSet, FieldGroup, Field, FieldLabel } from "~/components/ui/field";
import React, { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { deepEqual } from "~/utils/utils";

/* Make not-required fields optional like Partial<> and
 * required fields required. */
export type RequiredFields<T, R extends keyof T> = Partial<T> & Pick<T, R>;

export function satisfiesRequiredFields<T, R extends keyof T>(
  item: Partial<T>,
  required: R[],
): item is RequiredFields<T, R> {
  for (const k of required) {
    if (!(k in item && item[k])) {
      return false;
    }
  }
  return true;
}

/**
 * Generate an edit form using column defs!
 */
export type EditFormProps<T, R extends keyof T> = {
  item?: T;
  columns: ColumnDef<T, any>[]; // any: see comment in data-table.tsx
  onSave: (updates: RequiredFields<T, R>) => Promise<unknown>;

  /* Should be passed with `as const` so that R is inferred correctly,
   * rather than getting generalized to string[] */
  required?: R[];

  submitButton?: Partial<{
    title: string;
    disabledFn: (original: T | undefined, updates: Partial<T>) => boolean;
    props: React.ComponentProps<typeof Button>;
  }>;
};

export function EditForm<T extends object, R extends keyof T = never>({
  item,
  columns,
  onSave,
  required = [],
  submitButton = {},
}: EditFormProps<T, R>) {
  submitButton.title ??= "Save changes";
  submitButton.disabledFn ??= (original, updates) =>
    deepEqual({ ...original, ...updates }, original) ||
    !satisfiesRequiredFields(updates, required);
  submitButton.props ??= {};
  submitButton.props.className ??=
    "flex flex-col items-center justify-center mt-auto";

  const [updates, setUpdates] = useState<Partial<T>>({});

  /* Create an empty table to render from */
  const tableData = useMemo(() => [], []);
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // If item changed from underneath us, reset updates
  // (this method is funky but avoids a useEffect)
  const [prevItem, setPrevItem] = useState(item);
  if (item !== prevItem) {
    setPrevItem(item);
    setUpdates({});
  }

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    // cast: disabledFn should handle this check
    onSave(updates as RequiredFields<T, R>);
  };

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col">
      <FieldSet className="flex-1 flex flex-col">
        <FieldGroup>
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <React.Fragment key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = header.column.columnDef;
                  const id = header.column.id;
                  if (!id) throw new Error("Column missing ID");

                  const htmlId = id + "_input";
                  const Editor = column.meta?.editor;
                  if (Editor == null) return null;

                  const accessorFn = header.column.accessorFn;
                  if (!accessorFn) {
                    throw new Error(
                      `Column missing both accessorKey and accessorColumn: ${column}`,
                    );
                  }
                  const val = item == null ? undefined : accessorFn(item, 0);

                  return (
                    <Field key={id}>
                      <FieldLabel
                        htmlFor={htmlId}
                        className="text-sm font-semibold gap-1"
                      >
                        {flexRender(column.header, header.getContext())}
                        {(required as string[]).includes(id) ? (
                          <span className="text-destructive">*</span>
                        ) : null}
                      </FieldLabel>
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
                    </Field>
                  );
                })}
              </React.Fragment>
            );
          })}
        </FieldGroup>
        <Button
          disabled={item === null || submitButton.disabledFn(item, updates)}
          {...submitButton.props}
        >
          {submitButton.title}
        </Button>
      </FieldSet>
    </form>
  );
}
