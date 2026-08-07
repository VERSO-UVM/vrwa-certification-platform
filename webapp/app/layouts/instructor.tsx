import { InstructorSidebar } from "./navigation/instructor-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { protectedLoader } from "~/utils/session";

// Require instructor privileges for all pages under this layout
export const loader = protectedLoader("instructor");

export default function InstructorLayout() {
  return <SidebarLayout sidebar={InstructorSidebar} homeUrl="../instructor/" />;
}
