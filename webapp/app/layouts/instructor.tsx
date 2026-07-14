import { InstructorSidebar } from "~/instructor/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";
import { protectedLoader } from "~/utils/session";

export const loader = protectedLoader("instructor");

export default function Instructor() {
  return <SidebarLayout sidebar={InstructorSidebar} />;
}
