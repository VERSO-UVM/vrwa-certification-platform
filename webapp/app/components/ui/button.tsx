import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "~/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "vrwa-light:bg-red-400/30 vrwa-light:hover:bg-red-400/50 vrwa-light:text-gray-600 hover:vrwa-light:text-gray-700 dark:bg-red-500/25 dark:hover:bg-red-500/40 dark:text-gray-300 dark:hover:text-gray-200",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "vrwa-light:bg-gray-500/20 vrwa-light:hover:bg-gray-500/45 vrwa-light:text-gray-600 hover:vrwa-light:text-gray-700 dark:bg-gray-600/40 dark:hover:bg-gray-600/75 dark:text-gray-300",
        edit: "vrwa-light:bg-gray-500/15 vrwa-light:text-gray-900/60 vrwa-light:hover:bg-gray-500/30 vrwa-light:hover:text-gray-900/70 dark:bg-gray-400/15 dark:text-gray-100/70 dark:hover:bg-gray-400/30 dark:hover:text-gray-100/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        ghost_lighter:
          "vrwa-light:hover:bg-gray-400/40 dark:hover:bg-gray-600/40",
        link: "text-primary underline-offset-4 hover:underline vrwa-light:text-gray-700 vrwa-light:hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200",
        cancel_button:
          "vrwa-light:bg-gray-500/20 vrwa-light:hover:bg-gray-500/45 vrwa-light:text-gray-600 hover:vrwa-light:text-gray-700 dark:bg-gray-600/40 dark:hover:bg-gray-600/75 dark:text-gray-300",
        cancel_icon:
          "vrwa-light:hover:bg-gray-500/20 vrwa-light:text-gray-600 dark:hover:bg-gray-600/40 dark:text-gray-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
