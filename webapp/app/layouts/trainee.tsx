import { TraineeSidebar } from "./navigation/trainee-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";

export default function TraineeLayout() {
  return <SidebarLayout sidebar={TraineeSidebar} />;
}
