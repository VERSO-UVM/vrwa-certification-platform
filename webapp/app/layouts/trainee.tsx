import { UserSidebar } from "~/pages/trainee/navigation";
import { SidebarLayout } from "~/components/sidebar-layout";

export default function User() {
  return <SidebarLayout sidebar={UserSidebar} />;
}
