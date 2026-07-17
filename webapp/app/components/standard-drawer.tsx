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
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">{children}</div>
        <DrawerClose asChild>
          <Button variant="secondary" className="rounded-none absolute bottom-0 left-0 right-0 h-10 md:h-12">Cancel</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
