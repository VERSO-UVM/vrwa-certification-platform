import { AdminSidebar } from "~/admin/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";

export default function Admin() {
  return <SidebarLayout sidebar={AdminSidebar} />;
}
