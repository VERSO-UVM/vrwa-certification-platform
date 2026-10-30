import {
  BookOpenText,
  House,
  Scroll,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import { Link } from "react-router";
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

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/admin" />}>
                <House />
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/admin/course-manager" />}>
                <BookOpenText />
                Courses
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/admin/trainees" />}>
                <Users />
                Trainees
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/admin/users" />}>
                <UserCog />
                Users
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/admin/certifications" />}>
                <Trophy />
                Certifications
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/admin/invoices" />}>
                <Scroll />
                Invoices
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogOutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
