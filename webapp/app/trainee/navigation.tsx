import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { useSession, type Session } from "~/utils/auth";
import { useTRPC } from "~/utils/trpc";

export function UserSidebar() {
  const trpc = useTRPC();
  const activeProfileQuery = useQuery(trpc.profile.getActiveProfile.queryOptions());
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>VRWA</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/trainee">Home</Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/courses">Course Sign-up</Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/invoices">Payments</Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/member">Member Portal</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Link to="/profile-select" className="font-medium text-center">
            {activeProfileQuery.data?.firstName}
            {" "}
            {activeProfileQuery.data?.lastName}
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <Link to="/" className="font-medium text-center">
            Exit
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
