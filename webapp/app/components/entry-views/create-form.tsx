import { type ColumnDef } from "@tanstack/react-table";
import { EditForm } from "./edit-form";

/* Make not-required fields optional like Partial<> and
 * required fields required. */
export type RequiredFields<T, R extends keyof T> = {
  [K in keyof T]: K extends R ? T[K] : T[K] | undefined;
};

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
 * Generate a ¨Create¨ / "Add" form using ColumnDefs.
 */
export type CreateFormProps<T, R extends keyof T> = {
  columns: ColumnDef<T, any>[]; // any: see comment in data-table.tsx

  /* Should be passed with `as const` so that R is inferred correctly,
   * rather than getting generalized to string[] */
  required: R[];

  onSave: (values: RequiredFields<T, R>) => Promise<void>;
};

export function CreateForm<T extends object, R extends keyof T>({
  columns,
  required,
  onSave,
}: CreateFormProps<T, R>) {
  return (
    <EditForm
      columns={columns}
      onSave={(updates) => {
        if (!satisfiesRequiredFields(updates, required)) {
          // Required field not supplied
          return false;
        }
        onSave(updates);
      }}
      item={undefined}
      submitButton={{
        title: "Save",
        props: {
          className: "flex flex-col items-center justify-center mt-auto",
        },
        disabledFn: (_, updates) => {
          return !satisfiesRequiredFields(updates, required);
        },
      }}
    />
  );
}
