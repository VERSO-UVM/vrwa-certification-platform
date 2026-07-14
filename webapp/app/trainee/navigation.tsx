import { Link } from "react-router";
import { ActiveProfileIndicator } from "~/components/active-profile-indicator";
import { LogOutButton } from "~/components/logout-button";
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

export function UserSidebar() {
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
          <ActiveProfileIndicator />
        </SidebarMenuButton>
        <SidebarMenuButton asChild>
          <LogOutButton />
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
