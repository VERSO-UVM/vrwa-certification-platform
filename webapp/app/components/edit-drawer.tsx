import type { ColumnDef } from "@tanstack/react-table";
import { StandardDrawer, type StandardDrawerProps } from "./standard-drawer";
import { EditForm } from "./edit-form";
import { useState } from "react";

export interface EditDrawerProps<T> {
  item: T;
  columns: ColumnDef<T, any>[];
  onSave: (updates: Partial<T>) => Promise<void>;
  drawer: StandardDrawerProps;
}

/**
 * A wrapper around StandardDrawer and EditDrawer that handles
 * open/closed state to close the drawer after onSave, which
 * should be async and return a Promise when it is saved succesfully.
 */
export function EditDrawer<T extends object>({
  item,
  columns,
  onSave,
  drawer,
}: EditDrawerProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <StandardDrawer {...drawer} open={open} onOpenChange={setOpen}>
      <EditForm
        item={item}
        columns={columns}
        onSave={(updates: Partial<T>) =>
          onSave(updates).then(() => setOpen(false))
        }
      />
    </StandardDrawer>
  );
}
