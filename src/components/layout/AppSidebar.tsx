import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Boxes, ChevronDown, Circle, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import { buildMenuTree } from "@/features/menu/utils/menu-utils";
import type { MenuItemNode } from "@/features/menu/types/menu-item";

type AppSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const iconRegistry = LucideIcons as unknown as Record<string, LucideIcon>;

function getMenuIcon(iconName: string | null): LucideIcon {
  if (!iconName) {
    return Boxes;
  }

  const componentName = iconName
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return iconRegistry[componentName] ?? Circle;
}

function isRouteActive(route: string | null, pathname: string): boolean {
  if (!route) {
    return false;
  }

  const normalizedRoute = route.replace(/\/+$/, "") || "/";

  return (
    pathname === normalizedRoute ||
    (normalizedRoute !== "/" && pathname.startsWith(`${normalizedRoute}/`))
  );
}

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { pathname } = useLocation();

  const {
    data: items = [],
    isPending,
    isError,
    error,
    refetch,
  } = useMenuItems();

  const menuTree = useMemo(() => buildMenuTree(items), [items]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  function toggleExpanded(id: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function isBranchActive(node: MenuItemNode): boolean {
    return (
      isRouteActive(node.route, pathname) || node.children.some(isBranchActive)
    );
  }

  function renderMenuItem(item: MenuItemNode, depth = 0): ReactNode {
    const Icon = getMenuIcon(item.icon);
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const branchActive = isBranchActive(item);

    const linkClassName = (isActive: boolean) => {
      if (isActive) {
        // The currently selected menu item.
        return "flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors";
      }

      if (!item.route && branchActive) {
        // Parent menu with active child.
        return "flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-foreground transition-colors";
      }

      return "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
    };

    return (
      <div key={item.id}>
        <div className="flex items-center gap-1">
          {item.route ? (
            <NavLink
              to={item.route}
              end={item.route === "/"}
              onClick={onClose}
              className={({ isActive }) => linkClassName(isActive)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </NavLink>
          ) : hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(item.id)}
              aria-expanded={isExpanded}
              className={linkClassName(branchActive)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          ) : (
            <div
              className={`${linkClassName(false)} cursor-default`}
              aria-disabled="true"
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </div>
          )}

          {item.route && hasChildren && (
            <button
              type="button"
              aria-label={`Toggle ${item.label} submenu`}
              aria-expanded={isExpanded}
              onClick={() => toggleExpanded(item.id)}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-19 items-center justify-between border-b border-border px-5">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes size={22} />
            </span>

            <span>
              <span className="block text-sm font-bold tracking-tight">
                GSD
              </span>
              <span className="block text-xs text-muted-foreground">
                Inventory management
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
        >
          {isPending && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Loading menu...
            </p>
          )}

          {isError && (
            <div className="space-y-2 px-3 py-2">
              <p role="alert" className="text-sm text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Unable to load menu items."}
              </p>

              <button
                type="button"
                onClick={() => void refetch()}
                className="text-sm font-medium text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!isPending && !isError && menuTree.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No active menu items are available.
            </p>
          )}

          {!isPending && !isError && menuTree.length > 0 && (
            <div className="space-y-1">
              {menuTree.map((item) => renderMenuItem(item))}
            </div>
          )}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">Inventory workspace</p>
        </div>
      </aside>
    </>
  );
}
