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

export function InstructorSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Instructor</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/instructor">My Classes</Link>
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
