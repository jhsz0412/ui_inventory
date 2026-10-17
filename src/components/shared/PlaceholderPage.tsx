import { useMemo } from "react";
import { ArrowLeft, Boxes } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import {
  buildMenuTree,
  getMenuPageTitle,
} from "@/features/menu/utils/menu-utils";

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const { data: menuItems = [] } = useMenuItems();

  const menuTree = useMemo(() => buildMenuTree(menuItems), [menuItems]);
  const pageTitle = getMenuPageTitle(menuTree, pathname);

  return (
    <section className="rounded-xl border border-border bg-card px-6 py-16 text-center sm:py-20">
      <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Boxes size={26} />
      </span>

      <h2 className="text-xl font-semibold">{pageTitle}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        This section is ready for implementation. We’ll connect it to the
        corresponding backend endpoints when its feature is developed.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
      >
        <ArrowLeft size={15} />
        Return to dashboard
      </Link>
    </section>
  );
}
