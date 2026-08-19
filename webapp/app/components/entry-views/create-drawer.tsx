import type { ColumnDef } from "@tanstack/react-table";
import { StandardDrawer } from "../standard-drawer";
import { useState } from "react";
import { Button } from "../ui/button";
import { DrawerClose } from "../ui/drawer";
import { CreateForm } from "./create-form";

export interface CreateDrawerProps<T> {
  columns: ColumnDef<T, any>[]; // See comment in data-table.tsx
  onSave: (newItem: T) => Promise<void>;
  drawer: {
    buttonText: string;
    title: string;
    description: string;
  };
}

/**
 * A wrapper around StandardDrawer and EditForm that handles
 * open/closed state to close the drawer after onSave, which
 * should be async (to know it is saved successfully when Promise
 * resolves)
 */
export function CreateDrawer<T extends object>({
  columns,
  onSave,
  drawer: { buttonText, ...drawer },
}: CreateDrawerProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <StandardDrawer
      {...drawer}
      openButton={
        <Button variant="default">
          + {buttonText}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <CreateForm
        columns={columns}
        onSave={(updates: T) =>
          onSave(updates).then(() => setOpen(false))
        }
      />
      <DrawerClose asChild>
        <Button
          variant="cancel_button"
          className="flex flex-col items-center justify-center fixed bottom-4 left-4 right-4"
        >
          Cancel
        </Button>
      </DrawerClose>
    </StandardDrawer>
  );
}
