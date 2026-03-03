import { InstructorSidebar } from "~/instructor/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";

export default function Instructor() {
  return <SidebarLayout sidebar={InstructorSidebar} />;
}
