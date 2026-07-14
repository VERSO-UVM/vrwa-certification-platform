import { InstructorSidebar } from "~/instructor/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";
import { protectedLoader } from "~/utils/session";

// Require instructor privileges for all pages under this layout
export const loader = protectedLoader("instructor");

export default function Instructor() {
  return <SidebarLayout sidebar={InstructorSidebar} />;
}
