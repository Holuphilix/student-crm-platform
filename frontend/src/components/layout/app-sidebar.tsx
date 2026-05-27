import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { filterByRole } from "@/features/auth/utils/role-check";
import { navigationItems } from "@/lib/navigation/navigation.config";

export function AppSidebar() {
  const { role } = useAuth();

  const authorizedNavigationItems = filterByRole(
    navigationItems,
    role
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-4 py-4">
              <h2 className="text-xl font-bold">
                Student CRM
              </h2>
            </div>

            <SidebarMenu>
              {authorizedNavigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.href}>
                        <Icon className="h-4 w-4" />

                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
