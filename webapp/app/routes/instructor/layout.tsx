import { InstructorSidebar } from "~/instructor/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";
import { useRequireAuth } from "~/hooks/use-require-auth";

export default function Instructor() {
  const { session, isPending } = useRequireAuth(["instructor"]);

  if (isPending) return <div className="p-10">Loading session...</div>;
  if (!session) return null;

  return (
    <SidebarLayout sidebar={InstructorSidebar} requiredRole="instructor" />
  );
}
