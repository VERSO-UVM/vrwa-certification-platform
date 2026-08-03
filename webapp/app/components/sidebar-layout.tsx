import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";
import { Separator } from "./ui/separator";

type SidebarLayoutPRops = {
  sidebar: React.ComponentType;
};

export function SidebarLayout({ sidebar: Sidebar }: SidebarLayoutPRops) {
  return (
    <>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </header>
          <div className="flex-1">
            {/* See https://tailwindcss.com/docs/responsive-design#container-queries
                  Inside @container we can use @sm, @md, @lg, etc */}
            <main className="flex-1 flex flex-col pl-7 pr-3 py-10 z-40 @container">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
