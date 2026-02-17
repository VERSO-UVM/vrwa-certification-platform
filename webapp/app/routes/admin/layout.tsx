import { Outlet } from "react-router";
import { AdminSidebar } from "~/admin/navigation";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Admin() {
  return (
    <div>
      <SidebarProvider>
        <AdminSidebar />
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
