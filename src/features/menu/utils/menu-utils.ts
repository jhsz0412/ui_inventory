import type { MenuItem, MenuItemNode } from "@/features/menu/types/menu-item";

export function buildMenuTree(items: MenuItem[]): MenuItemNode[] {
  const nodeMap = new Map<string, MenuItemNode>();

  for (const item of items) {
    if (item.isActive) {
      nodeMap.set(item.id, {
        ...item,
        children: [],
      });
    }
  }

  const roots: MenuItemNode[] = [];

  for (const node of nodeMap.values()) {
    const parentId = node.parentMenuItemId;
    const parent = parentId ? nodeMap.get(parentId) : undefined;

    if (parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortNodes(nodes: MenuItemNode[]) {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);

    for (const node of nodes) {
      sortNodes(node.children);
    }
  }

  sortNodes(roots);

  return roots;
}

export function getMenuPageTitle(
  menuItems: MenuItemNode[],
  pathname: string,
): string {
  const allItems: MenuItemNode[] = [];

  function collect(nodes: MenuItemNode[]) {
    for (const node of nodes) {
      allItems.push(node);
      collect(node.children);
    }
  }

  collect(menuItems);

  const matchingItem = allItems
    .filter((item) => {
      if (!item.route) return false;

      const route = item.route.replace(/\/+$/, "") || "/";

      return (
        pathname === route ||
        (route !== "/" && pathname.startsWith(`${route}/`))
      );
    })
    .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0];

  if (matchingItem) return matchingItem.label;
  if (pathname === "/") return "Dashboard";

  return "Page";
}
