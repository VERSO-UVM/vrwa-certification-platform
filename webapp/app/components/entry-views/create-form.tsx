import {
  type ColumnDef,
} from "@tanstack/react-table";
import { EditForm } from "./edit-form";

/**
 * Generate an edit form using column defs!
 */
export type CreateFormProps<T> = {
  columns: ColumnDef<T, any>[]; // any: see comment in data-table.tsx
  onSave: (newItem: T) => void;
};

export function CreateForm<T extends object>({
  columns,
  onSave,
}: CreateFormProps<T>) {
  return (
    <EditForm
      columns={columns}
      onSave={(updates: Partial<T>) => onSave(updates as T)}
      item={{} as T}
      submitButton={{
        title: "Save",
        props: {
          /* Fix button to bottom of drawer */
          className:
            "flex flex-col items-center justify-center fixed bottom-15 left-4 right-4",
        },
        disabledFn: (_, updates) => {
          return false;
        },
      }}
    />
  );
}
