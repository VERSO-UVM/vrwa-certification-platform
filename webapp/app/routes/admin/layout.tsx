import { AdminSidebar } from "~/admin/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";
import { useRequireAuth } from "~/hooks/use-require-auth";

export default function Admin() {
  const { session, isPending } = useRequireAuth(["admin"]);

  if (isPending) return <div className="p-10">Loading session...</div>;
  if (!session) return null;

  return <SidebarLayout sidebar={AdminSidebar} requiredRole="admin" />;
}
