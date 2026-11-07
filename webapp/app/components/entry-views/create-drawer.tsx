/**
 * C in CRUD. Similar to EditDrawer with subtle differences.
 */

import { StandardDrawer } from "../standard-drawer";
import { useState } from "react";
import { Button } from "../ui/button";
import { DrawerClose } from "../ui/drawer";
import { EditForm, type EditFormProps } from "./edit-form";
import { Plus } from "lucide-react";

export interface CreateDrawerProps<T, R extends keyof T> extends EditFormProps<
  T,
  R
> {
  drawer: {
    buttonText: string;
    title: string;
    description: string;
  };
}

export function CreateDrawer<T extends object, R extends keyof T>({
  columns,
  onSave,
  required,
  drawer: { buttonText, ...drawer },
}: CreateDrawerProps<T, R>) {
  const [open, setOpen] = useState(false);

  return (
    <StandardDrawer
      {...drawer}
      openButton={
        <Button variant="default">
          <Plus /> {buttonText}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <EditForm
        columns={columns}
        required={required}
        onSave={(updates, item) =>
          onSave(updates, item).then(() => setOpen(false))
        }
      />
      <DrawerClose asChild>
        <Button variant="cancel_button">Cancel</Button>
      </DrawerClose>
    </StandardDrawer>
  );
}
