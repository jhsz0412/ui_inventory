import { NavLink } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import {
  navigationGroups,
  settingsNavigation,
  workspaceIcon,
} from "@/app/config/navigation";

type AppSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const WorkspaceIcon = workspaceIcon;

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
              <WorkspaceIcon size={22} />
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

        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-primary font-medium text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <NavLink
            to={settingsNavigation.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <settingsNavigation.icon size={18} />
            {settingsNavigation.label}
          </NavLink>

          <div className="mt-3 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Administrator</p>
              <p className="truncate text-xs text-muted-foreground">
                Local workspace
              </p>
            </div>
            <ShieldCheck size={16} className="text-muted-foreground" />
          </div>
        </div>
      </aside>
    </>
  );
}
