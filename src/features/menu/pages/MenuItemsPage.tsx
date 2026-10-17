import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
  type MenuItemRequest,
} from "@/features/menu/api/menu-api";
import { menuItemsQueryKey } from "@/features/menu/hooks/use-menu-items";
import type { MenuItem } from "@/features/menu/types/menu-item";
import {
  menuItemSchema,
  type MenuItemFormValues,
} from "@/features/menu/schemas/menu-item-schema";
import { ApiError } from "@/services/api-error";

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const labelClassName = "text-sm font-medium";
const errorClassName = "text-sm text-destructive";

export default function MenuItemsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // Fetch every menu item, including inactive items.
  // The sidebar's useMenuItems hook filters inactive items separately.
  const menuQuery = useQuery({
    queryKey: menuItemsQueryKey,
    queryFn: getMenuItems,
  });

  const items = useMemo(() => menuQuery.data ?? [], [menuQuery.data]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => {
      const parentName =
        items.find((candidate) => candidate.id === item.parentMenuItemId)
          ?.label ?? "";

      return [
        item.name,
        item.label,
        item.route ?? "",
        item.icon ?? "",
        parentName,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [items, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      label: "",
      route: "",
      icon: "",
      parentMenuItemId: "",
      permissionId: "",
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (!isFormOpen) return;

    reset(
      selectedItem
        ? {
            name: selectedItem.name,
            label: selectedItem.label,
            route: selectedItem.route ?? "",
            icon: selectedItem.icon ?? "",
            parentMenuItemId: selectedItem.parentMenuItemId ?? "",
            permissionId: selectedItem.permissionId ?? "",
            sortOrder: selectedItem.sortOrder,
          }
        : {
            name: "",
            label: "",
            route: "",
            icon: "",
            parentMenuItemId: "",
            permissionId: "",
            sortOrder: 0,
          },
    );
  }, [isFormOpen, selectedItem, reset]);

  useEffect(() => {
    if (!successMessage && !actionError) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
      setActionError("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage, actionError]);

  const saveMutation = useMutation({
    mutationFn: async (values: MenuItemFormValues) => {
      const request: MenuItemRequest = {
        name: values.name.trim(),
        label: values.label.trim(),
        route: values.route.trim() || null,
        icon: values.icon.trim() || null,
        parentMenuItemId: values.parentMenuItemId || null,
        permissionId: values.permissionId.trim() || null,
        sortOrder: values.sortOrder,
      };

      if (selectedItem) {
        return updateMenuItem(selectedItem.id, request);
      }

      return createMenuItem(request);
    },
    onSuccess: async (_result, values) => {
      await queryClient.invalidateQueries({ queryKey: menuItemsQueryKey });

      setIsFormOpen(false);
      setSelectedItem(null);
      setActionError("");
      setSuccessMessage(
        values.name ? "Menu item saved successfully." : "Menu item saved.",
      );
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to save the menu item. Please try again.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: menuItemsQueryKey });
      setActionError("");
      setSuccessMessage("Menu item deleted successfully.");
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to delete the menu item. Please try again.",
      );
    },
  });

  const onSubmit: SubmitHandler<MenuItemFormValues> = (values) => {
    setActionError("");
    saveMutation.mutate(values);
  };

  function openCreateForm() {
    setSelectedItem(null);
    setActionError("");
    setIsFormOpen(true);
  }

  function openEditForm(item: MenuItem) {
    setSelectedItem(item);
    setActionError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saveMutation.isPending || isSubmitting) return;

    setIsFormOpen(false);
    setSelectedItem(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the menu labels, routes, icons, and parent items used by
            the application sidebar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            + Create menu item
          </button>

          <button
            type="button"
            onClick={() => void menuQuery.refetch()}
            disabled={menuQuery.isFetching}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {menuQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"
        >
          {successMessage}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All menu items</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {menuQuery.isPending
                ? "Loading menu items..."
                : `${filteredItems.length} of ${items.length} menu items`}
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <label htmlFor="menu-item-search" className="sr-only">
              Search menu items
            </label>
            <input
              id="menu-item-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, route, parent..."
              className={inputClassName}
            />
          </div>
        </div>

        {menuQuery.isPending ? (
          <div
            role="status"
            className="p-10 text-center text-sm text-muted-foreground"
          >
            Loading menu items...
          </div>
        ) : menuQuery.isError ? (
          <div className="p-8 text-center">
            <p className="font-medium">Unable to load menu items.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {menuQuery.error instanceof Error
                ? menuQuery.error.message
                : "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={() => void menuQuery.refetch()}
              className="mt-4 h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              {search.trim()
                ? "No matching menu items found."
                : "No menu items found."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search.trim()
                ? "Try a different search term."
                : "Menu items returned by the backend will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  {[
                    "Label / Name",
                    "Route",
                    "Icon",
                    "Parent",
                    "Sort order",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 font-medium"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => {
                  const parent = items.find(
                    (candidate) => candidate.id === item.parentMenuItemId,
                  );

                  return (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.name}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {item.route ?? "—"}
                      </td>
                      <td className="px-4 py-3">{item.icon ?? "—"}</td>
                      <td className="px-4 py-3">{parent?.label ?? "—"}</td>
                      <td className="px-4 py-3">{item.sortOrder}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.isActive
                              ? "inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                              : "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            disabled={
                              saveMutation.isPending || deleteMutation.isPending
                            }
                            className="h-8 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete menu item "${item.label}"?`,
                                )
                              ) {
                                setActionError("");
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            disabled={
                              saveMutation.isPending || deleteMutation.isPending
                            }
                            className="h-8 rounded-md border border-destructive/40 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          >
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-item-form-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="menu-item-form-title" className="text-lg font-semibold">
                  {selectedItem ? "Edit menu item" : "Create menu item"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fields marked * are required. Leave route and parent empty for
                  a top-level grouping menu.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saveMutation.isPending || isSubmitting}
                aria-label="Close menu item form"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <span aria-hidden="true" className="text-xl">
                  ×
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="menu-name" className={labelClassName}>
                    Name *
                  </label>
                  <input
                    id="menu-name"
                    {...register("name")}
                    className={inputClassName}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && (
                    <p className={errorClassName}>{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="menu-label" className={labelClassName}>
                    Label *
                  </label>
                  <input
                    id="menu-label"
                    {...register("label")}
                    className={inputClassName}
                    aria-invalid={Boolean(errors.label)}
                  />
                  {errors.label && (
                    <p className={errorClassName}>{errors.label.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="menu-route" className={labelClassName}>
                    Route
                  </label>
                  <input
                    id="menu-route"
                    {...register("route")}
                    className={inputClassName}
                    placeholder="/settings/menu-items"
                    aria-invalid={Boolean(errors.route)}
                  />
                  {errors.route && (
                    <p className={errorClassName}>{errors.route.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="menu-icon" className={labelClassName}>
                    Lucide icon name
                  </label>
                  <input
                    id="menu-icon"
                    {...register("icon")}
                    className={inputClassName}
                    placeholder="settings"
                    aria-invalid={Boolean(errors.icon)}
                  />
                  {errors.icon && (
                    <p className={errorClassName}>{errors.icon.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="menu-parent" className={labelClassName}>
                    Parent menu
                  </label>
                  <select
                    id="menu-parent"
                    {...register("parentMenuItemId")}
                    className={inputClassName}
                  >
                    <option value="">No parent (top-level)</option>
                    {items
                      .filter((candidate) => candidate.id !== selectedItem?.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.label}
                        </option>
                      ))}
                  </select>
                  {errors.parentMenuItemId && (
                    <p className={errorClassName}>
                      {errors.parentMenuItemId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="menu-permission" className={labelClassName}>
                    Permission ID
                  </label>
                  <input
                    id="menu-permission"
                    {...register("permissionId")}
                    className={inputClassName}
                    placeholder="Optional permission UUID"
                    aria-invalid={Boolean(errors.permissionId)}
                  />
                  {errors.permissionId && (
                    <p className={errorClassName}>
                      {errors.permissionId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="menu-sort-order" className={labelClassName}>
                    Sort order *
                  </label>
                  <input
                    id="menu-sort-order"
                    type="number"
                    min="0"
                    step="1"
                    {...register("sortOrder", { valueAsNumber: true })}
                    className={inputClassName}
                    aria-invalid={Boolean(errors.sortOrder)}
                  />
                  {errors.sortOrder && (
                    <p className={errorClassName}>{errors.sortOrder.message}</p>
                  )}
                </div>
              </div>

              {saveMutation.isError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {saveMutation.error instanceof ApiError
                    ? saveMutation.error.message
                    : "Unable to save the menu item."}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saveMutation.isPending || isSubmitting}
                  className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || isSubmitting}
                  className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {saveMutation.isPending
                    ? "Saving..."
                    : selectedItem
                      ? "Save changes"
                      : "Create menu item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
