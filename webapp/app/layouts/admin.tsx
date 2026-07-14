import { AdminSidebar } from "~/admin/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";
import { protectedLoader } from "~/utils/session";

export const loader = protectedLoader("admin");

export default function Admin() {
  return <SidebarLayout sidebar={AdminSidebar} />;
}
