import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground">
        You do not have permission to access this resource.
      </p>
      <Button asChild>
        <Link to="/">Return Home</Link>
      </Button>
    </div>
  );
}
