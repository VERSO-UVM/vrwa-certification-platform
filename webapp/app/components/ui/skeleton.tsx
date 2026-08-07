import { cn } from "~/utils/utils";
import { Card, CardContent, CardHeader } from "./card";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

function SkeletonCard({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card className="w-full" {...props}>
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  );
}

export { Skeleton, SkeletonCard };
