import { Outlet } from "react-router";
import { AdminSidebar } from "~/admin/navigation";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Admin() {
  return (
    <div>
      <SidebarProvider>
        <AdminSidebar />
        <div>
          <SidebarTrigger className="fixed" />
          <main className="flex-1 flex pl-4">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
