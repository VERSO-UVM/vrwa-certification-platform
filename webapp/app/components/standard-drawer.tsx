import { Button } from "./ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
  DrawerDescription,
  DrawerClose,
} from "./ui/drawer";
import type { PropsWithChildren, ReactElement } from "react";
import { X } from "lucide-react";

/**
 * I just got sick of the number of <DrawerXxxx> components cluttering
 * imports and the JSX.
 */
export type StandardDrawerProps = PropsWithChildren<{
  openButton: ReactElement;
  title: string;
  // We always need a description for `aria-describedby`
  description: string;
}> &
  React.ComponentProps<typeof Drawer>;

export function StandardDrawer({
  openButton,
  title,
  description,
  children,
  ...props
}: StandardDrawerProps) {
  return (
    <Drawer swipeDirection="right" {...props}>
      <DrawerTrigger render={openButton} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose
            render={
              <Button
                variant="cancel_icon"
                className="absolute top-2 right-2"
              />
            }
          >
            <X className="size-5" />
          </DrawerClose>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-2 pb-3 flex-1 flex flex-col gap-2">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
