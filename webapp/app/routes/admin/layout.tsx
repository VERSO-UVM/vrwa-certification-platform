import { Outlet } from "react-router";
import { AdminSidebar } from "~/admin/navigation";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Admin() {
  return (
    <div>
      <SidebarProvider>
        <AdminSidebar />
        <main className="flex-1">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
