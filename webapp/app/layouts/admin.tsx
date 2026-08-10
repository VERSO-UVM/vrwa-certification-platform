import { AdminSidebar } from "./navigation/admin-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { protectedLoader } from "~/utils/session";

// Require admin privilages for all pages under this layout
export const loader = protectedLoader("admin");

export default function AdminLayout() {
  return <SidebarLayout sidebar={AdminSidebar} homeUrl="/admin/" />;
}
