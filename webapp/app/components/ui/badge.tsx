import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "~/utils/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Variants for class locations
        blue: "bg-blue-200/50 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
        violet:
          "bg-violet-200/50 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
        indigo:
          "bg-indigo-200/50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
        // Variants for paid/unpaid indicators
        green:
          "vrwa-light:bg-green-700/10 vrwa-light:text-green-700 dark:bg-green-900/40 dark:text-green-500/90",
        orange:
          "bg-amber-600/15 text-amber-600 dark:bg-amber-900/40 dark:text-amber-500/90",
        // Variants for role badges
        yellow:
          "vrwa-light:bg-[#ffd66644] vrwa-light:text-[#765e1e] dark:bg-[#91752955] dark:text-[#e4be57]",
        other_green:
          "vrwa-light:bg-[#90B76633] vrwa-light:text-[#2f5e28] dark:bg-[#2f5e2855] dark:text-[#90b766]",
        other_blue:
          "vrwa-light:bg-[#5a8acc22] vrwa-light:text-[#153383] dark:bg-[#15338355] dark:text-[#84a8d9]",
        // Variants for members/non members
        not_member:
          "vrwa-light:bg-gray-700/10 vrwa-light:border-gray-700/20 dark:bg-gray-100/13 dark:border-gray-100/30",
        member: "vrwa-light:border-gray-700/20 dark:border-gray-100/30",
        // Others
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
