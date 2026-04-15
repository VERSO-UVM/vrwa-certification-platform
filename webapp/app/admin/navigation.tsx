import { BookOpenText, House, LogOut, Scroll, Trophy, Users, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router";
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
import { authClient } from "~/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { SidebarProfileSwitcher } from "~/components/sidebar-profile-switcher";

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold">VRWA Training</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin">
                  <House className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/course-manager">
                  <BookOpenText className="mr-2 h-4 w-4" />
                  Courses
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/trainees">
                  <Users className="mr-2 h-4 w-4" />
                  Trainees
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/instructors">
                  <Users className="mr-2 h-4 w-4" />
                  Instructors
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/certifications">
                  <Trophy className="mr-2 h-4 w-4" />
                  Certifications
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/invoices">
                  <Scroll className="mr-2 h-4 w-4" />
                  Invoices
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarProfileSwitcher />
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 p-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center">
                <Eye className="mr-1 h-3 w-3" /> SWITCH VIEW
              </span>
              <Select onValueChange={(value) => navigate(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/trainee">Trainee View</SelectItem>
                  <SelectItem value="/instructor">Instructor View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
