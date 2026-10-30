import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "vrwa-light:bg-gray-500/20 vrwa-light:hover:bg-gray-500/45 vrwa-light:text-gray-600 hover:vrwa-light:text-gray-700 dark:bg-gray-600/40 dark:hover:bg-gray-600/75 dark:text-gray-300",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "vrwa-light:bg-red-400/30 vrwa-light:hover:bg-red-400/50 vrwa-light:text-gray-600 hover:vrwa-light:text-gray-700 dark:bg-red-500/25 dark:hover:bg-red-500/40 dark:text-gray-300 dark:hover:text-gray-200",
        edit: "vrwa-light:bg-gray-500/15 vrwa-light:text-gray-900/60 vrwa-light:hover:bg-gray-500/30 vrwa-light:hover:text-gray-900/70 dark:bg-gray-400/15 dark:text-gray-100/70 dark:hover:bg-gray-400/30 dark:hover:text-gray-100/80",
        ghost_lighter:
          "vrwa-light:hover:bg-gray-400/40 dark:hover:bg-gray-600/40",
        link: "text-primary underline-offset-4 hover:underline vrwa-light:text-gray-700 vrwa-light:hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-200",
        cancel_button:
          "vrwa-light:bg-gray-500/20 vrwa-light:hover:bg-gray-500/45 vrwa-light:text-gray-600 hover:vrwa-light:text-gray-700 dark:bg-gray-600/40 dark:hover:bg-gray-600/75 dark:text-gray-300",
        cancel_icon:
          "vrwa-light:hover:bg-gray-500/20 vrwa-light:text-gray-600 dark:hover:bg-gray-600/40 dark:text-gray-300",
      },
      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
