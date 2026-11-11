import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/utils/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
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
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
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
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
