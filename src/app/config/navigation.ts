import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  Tags,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigationGroups: NavGroup[] = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Items", path: "/inventory/items", icon: Package },
      { label: "Categories", path: "/inventory/categories", icon: Tags },
      { label: "Warehouses", path: "/inventory/warehouses", icon: Warehouse },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        label: "Stock movements",
        path: "/inventory/stock-movements",
        icon: Activity,
      },
      {
        label: "Requisitions",
        path: "/requisitions",
        icon: ClipboardList,
      },
      { label: "Deliveries", path: "/deliveries", icon: Truck },
    ],
  },
  {
    label: "ANALYTICS",
    items: [{ label: "Reports", path: "/reports", icon: BarChart3 }],
  },
];

export const settingsNavigation: NavItem = {
  label: "Settings",
  path: "/settings",
  icon: Settings,
};

export const workspaceIcon = Boxes;

export function getPageTitle(pathname: string): string {
  const allItems = [
    ...navigationGroups.flatMap((group) => group.items),
    settingsNavigation,
  ];

  return (
    allItems.find((item) => item.path === pathname)?.label ?? "Page not found"
  );
}
