import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Link } from "react-router";
import { User } from "lucide-react";

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
          <header className="flex w-full h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <div className="flex w-60 h-16 items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="ml-1 mr-2 xl:ml-2 xl:mr-3 data-[orientation=vertical]:h-4" />
            <Link to={homeUrl}>
              <img className="h-10 object-cover" src="../../app/logo-dark.png" alt="VRWA Logo" />
            </Link>
          </div>
            <User className="size-7 bg-gray-400 rounded-full"/>
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
