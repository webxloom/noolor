import {
  BookCopy,
  BookOpenText,
  Calendar,
  LayoutDashboard,
  Library,
  LogOut,
  Newspaper,
  PenTool,
  Settings,
  Star,
  User,
  UserPlus,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin-dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Invites",
    href: "/admin-dashboard/invites",
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin-dashboard/users",
    icon: <User className="h-5 w-5" />,
  },
  // {
  //   label: "Authors",
  //   href: "/admin-dashboard/authors",
  //   icon: <PenTool className="h-5 w-5" />,
  // },
  // {
  //   label: "Publications",
  //   href: "/admin-dashboard/publications",
  //   icon: <Library className="h-5 w-5" />,
  // },
  // {
  //   label: "Readers",
  //   href: "/admin-dashboard/readers",
  //   icon: <BookOpenText className="h-5 w-5" />,
  // },
  {
    label: "Books",
    href: "/admin-dashboard/books",
    icon: <BookCopy className="h-5 w-5" />,
  },
  {
    label: "Blogs",
    href: "/admin-dashboard/blogs",
    icon: <Newspaper className="h-5 w-5" />,
  },
  {
    label: "Events",
    href: "/admin-dashboard/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Reviews",
    href: "/admin-dashboard/reviews",
    icon: <Star className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/admin-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: "Logout",
    href: "/login",
    icon: <LogOut className="h-5 w-5" />,
  },
];
