import { UserSidebar } from "~/trainee/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";
import { useRequireAuth } from "~/hooks/use-require-auth";

export default function User() {
  const { session, isPending } = useRequireAuth(["user"]);

  if (isPending) return <div className="p-10">Loading session...</div>;
  if (!session) return null;

  return <SidebarLayout sidebar={UserSidebar} requiredRole="user" />;
}
