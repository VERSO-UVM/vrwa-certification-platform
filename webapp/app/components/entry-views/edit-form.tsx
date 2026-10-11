import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { FieldSet, FieldGroup, Field, FieldLabel } from "~/components/ui/field";
import React, { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  deepEqual,
  isInputUnset,
  without,
} from "~/utils/utils";

/* Make not-required fields optional like Partial<> and
 * required fields required. */
export type RequiredFields<T, R extends keyof T> = Partial<T> & Pick<T, R>;

/**
 * Refine the more general Partial<T> into the more specific RequiredFields<T, R>.
 */
export function satisfiesRequiredFields<T, R extends keyof T>(
  item: Partial<T>,
  required: {
    [K in R]: {};
  },
): item is RequiredFields<T, R> {
  for (const k in required) {
    if (!(k in item && item[k])) {
      return false;
    }
  }
  return true;
}

/**
 * Generate an edit form using column defs!
 */
export interface EditFormProps<T, R extends keyof T> {
  /**
   * The original item we are editing, or `undefined` if there is no original.
   */
  item?: T;

  /**
   * ColumnDefs that can be the same as the ones past to the DataTable
   * component, but they all must have a meta.editor field that define
   * an input component.
   */
  columns: ColumnDef<T, any>[]; // any: see comment in data-table.tsx

  /**
   * All fields set with `required` are guaranteed to be set.
   */
  onSave: (
    changes: Partial<T>,
    newItem: RequiredFields<T, R>,
  ) => Promise<unknown>;

  /* Define required fields. This is what is used to infer
   * generic R, so non-required fields are just unset. */
  required: {
    [L in R]: {};
  };

  submitButton?: Partial<{
    title: string | React.ReactNode;
    disabledFn: (changes: Partial<T>, newItem: Partial<T>) => boolean;
    props: React.ComponentProps<typeof Button>;
  }>;
}

export function EditForm<T extends object, R extends keyof T>({
  item,
  columns,
  onSave,
  required,
  submitButton = {},
}: EditFormProps<T, R>) {
  submitButton.title ??= "Save changes";
  submitButton.disabledFn ??= (updates, _) =>
    Object.entries(updates).length === 0;
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

  const newItem = { ...item, ...updates };

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!satisfiesRequiredFields(newItem, required)) {
      throw new Error(
        "Should not have been able to submit without required field.",
      );
    }
    onSave(updates, newItem);
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
                        className="text-sm font-semibold gap-2"
                      >
                        {flexRender(column.header, header.getContext())}
                        {id in required ? (
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
                          required: id in required,
                        }}
                        onBlur={(_value) => {}}
                        onChange={(value) => {
                          const k = id as keyof T;
                          if (item?.[k] == null && isInputUnset(value)) {
                            // Original value was unset and new input is unset.
                            setUpdates(without(updates, k));
                          } else if (deepEqual(value, item?.[k])) {
                            // Value matches original
                            setUpdates(without(updates, k));
                          } else {
                            setUpdates({
                              ...updates,
                              [id]: value,
                            });
                          }
                        }}
                      />
                    </Field>
                  );
                })}
              </React.Fragment>
            );
          })}
        </FieldGroup>
        <Button
          disabled={item === null || submitButton.disabledFn(updates, newItem)}
          {...submitButton.props}
        >
          {submitButton.title}
        </Button>
      </FieldSet>
    </form>
  );
}
