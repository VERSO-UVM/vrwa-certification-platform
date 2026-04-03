import type { ColumnDef } from "@tanstack/react-table";
import { StandardDrawer } from "../standard-drawer";
import { EditForm } from "./edit-form";
import { useState } from "react";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";

export interface EditDrawerProps<T> {
  item: T;
  columns: ColumnDef<T, any>[]; // See comment in data-table.tsx
  onSave: (updates: Partial<T>) => Promise<void>;
  drawer: {
    buttonText: string;
    title: string,
    description: string,
  }
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
  drawer: { buttonText, ...drawer },
}: EditDrawerProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <StandardDrawer
      {...drawer}
      openButton={
        <Button variant="secondary">
          <SquarePen />
          {buttonText}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
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
