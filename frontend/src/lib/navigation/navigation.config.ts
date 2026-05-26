import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

export const navigationItems = [
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
  },
];