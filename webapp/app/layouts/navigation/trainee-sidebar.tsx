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
              <SidebarMenuButton render={<Link to="/trainee" />}>
                <Home />
                Home
              </SidebarMenuButton>
              <SidebarMenuButton render={<Link to="/trainee/registration" />}>
                <BookOpenText />
                Registration
              </SidebarMenuButton>
              <SidebarMenuButton render={<Link to="/trainee/certificates" />}>
                <Trophy />
                Certificates
              </SidebarMenuButton>
              <SidebarMenuButton render={<Link to="/trainee/invoices" />}>
                <Scroll />
                Payments
              </SidebarMenuButton>
              <SidebarMenuButton render={<Link to="/trainee/member" />}>
                <Star />
                Member Portal
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ActiveProfileIndicator />
        <LogOutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
