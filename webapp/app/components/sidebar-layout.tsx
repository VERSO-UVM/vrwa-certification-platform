import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Link } from "react-router";

type SidebarLayoutProps = {
  sidebar: React.ComponentType;
  homeUrl: string;
};

export function SidebarLayout({ sidebar: Sidebar, homeUrl}: SidebarLayoutProps) {
  return (
    <>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Link to={homeUrl}>
              <img className="h-10 object-cover" src="../../app/logo.png" alt="VRWA Logo" />
            </Link>

          </header>
          <div className="flex-1">
            {/* See https://tailwindcss.com/docs/responsive-design#container-queries
                  Inside @container we can use @sm, @md, @lg, etc */}
            <main className="flex-1 flex flex-col pl-5 pr-5 py-10 z-40 @container">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
