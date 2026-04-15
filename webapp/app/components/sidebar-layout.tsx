import { Outlet, Link } from "react-router";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { useSession } from "~/lib/auth-client";

type SidebarLayoutProps = {
  sidebar: React.ComponentType;
  requiredRole?: string;
};

export function SidebarLayout({ sidebar: Sidebar, requiredRole }: SidebarLayoutProps) {
  const { data: session } = useSession();
  const userRole = session?.user.role || "user";

  const isVirtualMode = requiredRole && userRole !== requiredRole && (
    (userRole === "admin") || (userRole === "instructor" && requiredRole === "user")
  );

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {isVirtualMode && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex justify-between items-center">
            <span>
              You are an <strong>{userRole}</strong>, but this is the <strong>{requiredRole}</strong> view. Browse around, or{" "}
              <Link to={userRole === "admin" ? "/admin" : "/instructor"} className="font-bold underline hover:no-underline">
                click here to return
              </Link>
            </span>
          </div>
        )}
        <div className="flex-1 relative">
          <SidebarTrigger className="fixed z-10" />
          {/* See https://tailwindcss.com/docs/responsive-design#container-queries
                Inside @container we can use @sm, @md, @lg, etc */}
          <main className="flex-1 flex flex-col pl-7 pr-3 py-10 @container h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
