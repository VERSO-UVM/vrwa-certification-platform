import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

type SidebarLayoutPRops = {
  sidebar: React.ComponentType;
};

export function SidebarLayout({ sidebar: Sidebar }: SidebarLayoutPRops) {
  return (
    <SidebarProvider>
      <Sidebar />
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
