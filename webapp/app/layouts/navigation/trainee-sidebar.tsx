import { BookOpenText, Home, Scroll, Star, Trophy } from "lucide-react";
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

export function TraineeSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>VRWA</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/trainee">
                  <Home />
                  Home
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/registration">
                  <BookOpenText />
                  Registration
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/certificates">
                  <Trophy />
                  Certificates
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/invoices">
                  <Scroll />
                  Payments
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/trainee/member">
                  <Star />
                  Member Portal
                </Link>
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
