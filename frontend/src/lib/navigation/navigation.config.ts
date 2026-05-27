import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BriefcaseBusiness,
  Settings,
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
  },
  {
    title: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
  },
  {
    title: "Deals",
    href: "/deals",
    icon: BriefcaseBusiness,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    allowedRoles: ["admin"],
  },
];
