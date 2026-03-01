import { Outlet } from "react-router";
import { UserSidebar } from "~/trainee/navigation";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function User() {
  return (
    <SidebarProvider>
      <UserSidebar />
      <div className="flex-1">
        <SidebarTrigger className="fixed" />
        {/* See https://tailwindcss.com/docs/responsive-design#container-queries
              Inside @container we can use @sm, @md, @lg, etc */}
        <main className="flex-1 flex flex-col pl-7 pr-3 py-10 @container">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
