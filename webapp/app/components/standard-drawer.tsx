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
import type { PropsWithChildren } from "react";
import { X } from "lucide-react";

/**
 * I just got sick of the number of <DrawerXxxx> components cluttering
 * imports and the JSX.
 */
export type StandardDrawerProps = PropsWithChildren<{
  openButton: React.ReactNode;
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
    <Drawer direction="right" {...props}>
      <DrawerTrigger asChild>{openButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="cancel_icon" className="absolute top-2 right-2">
              <X className="size-5" />
            </Button>
          </DrawerClose>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
