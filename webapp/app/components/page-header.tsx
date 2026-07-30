import { cn } from "~/utils/utils";

export function PageHeader({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.ComponentProps<"h1">>) {
  return (
    <h1
      className={cn("text-2xl font-bold tracking-tight pb-6", className)}
      {...props}
    >
      {children}
    </h1>
  );
}
