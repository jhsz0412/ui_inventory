export type MenuItem = {
  id: string;
  name: string;
  label: string;
  route: string | null;
  icon: string | null;
  parentMenuItemId: string | null;
  permissionId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type MenuItemNode = MenuItem & {
  children: MenuItemNode[];
};
