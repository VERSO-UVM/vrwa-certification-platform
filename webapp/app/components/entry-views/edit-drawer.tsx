import { StandardDrawer } from "../standard-drawer";
import { EditForm, type EditFormProps } from "./edit-form";
import { useState } from "react";
import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import { DrawerClose } from "../ui/drawer";

export interface EditDrawerProps<T, R extends keyof T> extends EditFormProps<
  T,
  R
> {
  item: T;
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
export function EditDrawer<T extends object, R extends keyof T>({
  item,
  columns,
  onSave,
  required,
  drawer: { buttonText, ...drawer },
}: EditDrawerProps<T, R>) {
  const [open, setOpen] = useState(false);

  return (
    <StandardDrawer
      {...drawer}
      openButton={
        <Button variant="edit">
          <SquarePen />
          {buttonText}
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <EditForm
        item={item}
        required={required}
        columns={columns}
        onSave={(updates) => onSave(updates).then(() => setOpen(false))}
        submitButton={{
          title: "Save changes",
          props: {
            /* Fix button to bottom of drawer */
            className:
              "flex flex-col items-center justify-center fixed bottom-15 left-4 right-4",
          },
        }}
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
