import type { ColumnDef } from "@tanstack/react-table";
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

export type StandardDrawerProps = PropsWithChildren<{
  buttonText: string;
  title: string;
  // We always need a description for `aria-describedby`
  description: string;
}> &
  React.ComponentProps<typeof Drawer>;

export function StandardDrawer({
  buttonText,
  title,
  description,
  children,
  ...props
}: StandardDrawerProps) {
  return (
    <Drawer direction="right" {...props}>
      <DrawerTrigger asChild>
        <Button variant="secondary">
          {buttonText}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">{children}</div>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
