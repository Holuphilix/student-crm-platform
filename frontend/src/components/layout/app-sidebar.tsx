import { NavLink } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { filterByRole } from "@/features/auth/utils/role-check";
import { navigationItems } from "@/lib/navigation/navigation.config";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    label: "Main",
    items: ["Dashboard"],
  },
  {
    label: "CRM",
    items: [
      "Clients",
      "Profile",
      "Conversations",
      "My Conversations",
      "Deals",
      "My Deals",
    ],
  },
  {
    label: "System",
    items: ["Users", "Settings"],
  },
];

const iconColorStyles: Record<string, string> = {
  Dashboard: "text-blue-600 bg-blue-50 ring-blue-100",
  Clients: "text-violet-600 bg-violet-50 ring-violet-100",
  Profile: "text-violet-600 bg-violet-50 ring-violet-100",
  Conversations: "text-emerald-600 bg-emerald-50 ring-emerald-100",
  "My Conversations": "text-emerald-600 bg-emerald-50 ring-emerald-100",
  Deals: "text-orange-600 bg-orange-50 ring-orange-100",
  "My Deals": "text-orange-600 bg-orange-50 ring-orange-100",
  Users: "text-indigo-600 bg-indigo-50 ring-indigo-100",
  Settings: "text-slate-600 bg-slate-50 ring-slate-100",
};

const activeIconColorStyles: Record<string, string> = {
  Dashboard: "text-blue-700 bg-blue-100 ring-blue-200",
  Clients: "text-violet-700 bg-violet-100 ring-violet-200",
  Profile: "text-violet-700 bg-violet-100 ring-violet-200",
  Conversations: "text-emerald-700 bg-emerald-100 ring-emerald-200",
  "My Conversations": "text-emerald-700 bg-emerald-100 ring-emerald-200",
  Deals: "text-orange-700 bg-orange-100 ring-orange-200",
  "My Deals": "text-orange-700 bg-orange-100 ring-orange-200",
  Users: "text-indigo-700 bg-indigo-100 ring-indigo-200",
  Settings: "text-slate-700 bg-slate-100 ring-slate-200",
};

export function AppSidebar() {
  const { role } = useAuth();

  const authorizedNavigationItems = filterByRole(
    navigationItems,
    role
  );
  const authorizedNavigationByTitle = new Map(
    authorizedNavigationItems.map((item) => [
      item.title,
      item,
    ])
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-5" />
          </div>
          <div className="min-w-0 transition-[opacity,width] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <h2 className="truncate text-lg font-bold">
              Student CRM
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              Education sales
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-2 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5">
        {navigationGroups.map((group, groupIndex) => {
          const groupItems = group.items
            .map((title) =>
              authorizedNavigationByTitle.get(title)
            )
            .filter(
              (
                item
              ): item is NonNullable<typeof item> =>
                Boolean(item)
            );

          if (groupItems.length === 0) {
            return null;
          }

          return (
            <SidebarGroup
              key={group.label}
              className="p-0 group-data-[collapsible=icon]:items-center"
            >
              {groupIndex > 0 ? (
                <SidebarSeparator className="my-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-7" />
              ) : null}
              <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                {group.label}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const iconColor =
                      iconColorStyles[item.title] ??
                      iconColorStyles.Settings;
                    const activeIconColor =
                      activeIconColorStyles[item.title] ??
                      activeIconColorStyles.Settings;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className="h-auto p-0 hover:bg-transparent active:bg-transparent"
                        >
                          <NavLink
                            to={item.href}
                            end={item.href === "/"}
                            aria-label={item.title}
                            className={({ isActive }) =>
                              cn(
                                "relative flex min-h-10 w-full items-center gap-3 rounded-lg border border-transparent border-l-4 border-l-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-slate-200 hover:border-l-slate-300 hover:bg-slate-50 hover:text-foreground hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0",
                                isActive &&
                                  "border-slate-200 border-l-primary bg-primary/8 font-bold text-foreground shadow-sm hover:border-l-primary hover:bg-primary/10"
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <span
                                  className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-md ring-1 transition-colors",
                                    isActive
                                      ? activeIconColor
                                      : iconColor
                                  )}
                                >
                                  <Icon className="size-4" />
                                </span>

                                <span className="truncate transition-[opacity,width] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                                  {item.title}
                                </span>
                              </>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
