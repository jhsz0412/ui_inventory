import { useMemo, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import {
  buildMenuTree,
  getMenuPageTitle,
} from "@/features/menu/utils/menu-utils";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AppHeaderProps = {
  onMenuClick: () => void;
};

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: menuItems = [] } = useMenuItems();

  const menuTree = useMemo(() => buildMenuTree(menuItems), [menuItems]);
  const pageTitle = getMenuPageTitle(menuTree, pathname);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Continue to the login screen even if the logout request fails.
    } finally {
      setIsLoggingOut(false);
      setIsProfileOpen(false);
      navigate("/login", { replace: true });
    }
  }

  const displayName = user?.userName || "Guest User";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "AD";

  return (
    <header className="sticky top-0 z-30 flex h-19 items-center justify-between gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-muted lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            Inventory / {pageTitle}
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search size={16} />
          <span>Search inventory</span>
          <span className="ml-4 rounded border border-border px-1.5 py-0.5 text-[10px]">
            Ctrl K
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg border border-border p-2.5 text-muted-foreground hover:bg-muted"
        >
          <Bell size={18} />
        </button>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-muted"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {initials}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "Workspace"}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-muted-foreground transition-transform sm:block ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsProfileOpen(false)}
              />

              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-card p-2 shadow-lg"
              >
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email || "Workspace"}
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Logging out..." : "Sign Out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
