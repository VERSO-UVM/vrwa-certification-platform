import { Outlet } from "react-router";
import { AdminSidebar } from "~/admin/navigation";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Admin() {
  return (
    <div>
      <SidebarProvider>
        <AdminSidebar />
        <div className="flex-1">
          <SidebarTrigger className="fixed" />
          <main className="flex-1 flex pl-7 pr-3 py-10">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
