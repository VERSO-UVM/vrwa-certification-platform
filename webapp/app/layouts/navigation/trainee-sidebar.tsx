import * as React from "react";
import { BookOpenText, Home, Scroll, Star, Trophy, Sun, Moon, Cog } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

export function TraineeSidebar() {
  // if (document.cookie == null) {
  //   document.cookie = "vrwa-light"
  // }

  document.cookie = "vrwa-light"

  let savedTheme = document.cookie;

  const [theme, setTheme] = React.useState(savedTheme.toString())

  React.useEffect(() => {
    console.log("TEST")
    console.log(theme)
    const oldTheme = window.localStorage.getItem("theme")
    if (oldTheme == null) {
      document.body.classList.add(theme)
      console.log("null")
      console.log(theme)
    } else {
      document.body.classList.replace(oldTheme, theme)
      console.log("not null")
      console.log(theme)
      console.log(oldTheme)
    }
    window.localStorage.setItem("theme", theme)
  }, [theme])

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-3 w-20">Theme</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 ml-3">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Select website theme:</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={setTheme}
              >
                <DropdownMenuRadioItem value="vrwa-light">
                  <Sun />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system" disabled>
                  <Cog />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
