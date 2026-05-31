import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BriefcaseBusiness,
  Settings,
  UserCog,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";

import type { UserRole } from "@/features/auth/types/auth.types";

type NavigationItem = {
  title: string;
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
  allowedRoles?: UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    allowedRoles: ["admin", "manager", "sales"],
  },
  {
    title: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
    allowedRoles: ["admin", "manager", "sales"],
  },
  {
    title: "My Conversations",
    href: "/conversations",
    icon: MessageSquare,
    allowedRoles: ["client", "user"],
  },
  {
    title: "Deals",
    href: "/deals",
    icon: BriefcaseBusiness,
    allowedRoles: ["admin", "manager", "sales"],
  },
  {
    title: "My Deals",
    href: "/deals",
    icon: BriefcaseBusiness,
    allowedRoles: ["client", "user"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserRound,
    allowedRoles: ["client", "user"],
  },
  {
    title: "Users",
    href: "/users",
    icon: UserCog,
    allowedRoles: ["admin", "manager"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    allowedRoles: ["admin", "manager", "sales"],
  },
];
