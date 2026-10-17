import { useEffect, useMemo, useState } from "react";
import { useInventoryItems } from "@/features/inventory/hooks/use-inventory-items";
import CreateInventoryItemForm from "@/features/inventory/components/CreateInventoryItemForm";
import UpdateInventoryItemForm from "@/features/inventory/components/UpdateInventoryItemForm";
import type { InventoryItem } from "@/features/inventory/types/inventory-item";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteInventoryItem,
  restoreInventoryItem,
  permanentlyDeleteInventoryItem,
} from "@/features/inventory/api/inventory-api";
import { ApiError } from "@/services/api-error";

export default function InventoryItemsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");

  const itemActionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "delete" | "restore" | "permanent-delete";
    }) => {
      switch (action) {
        case "delete":
          await deleteInventoryItem(id);
          return action;
        case "restore":
          await restoreInventoryItem(id);
          return action;
        case "permanent-delete":
          await permanentlyDeleteInventoryItem(id);
          return action;
      }
    },
    onSuccess: async (action) => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory", "items"],
      });

      setActionError("");

      const messages = {
        delete: "Inventory item marked as inactive.",
        restore: "Inventory item restored successfully.",
        "permanent-delete": "Inventory item permanently deleted.",
      };

      setSuccessMessage(messages[action]);
    },
    onError: (error) => {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "The inventory item action failed. Please try again.",
      );
    },
  });

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    if (!actionError) return;

    const timeoutId = window.setTimeout(() => {
      setActionError("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [actionError]);

  const [search, setSearch] = useState("");
  const {
    data: items,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useInventoryItems();

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items ?? [];

    return (items ?? []).filter(
      (item) =>
        item.itemCode.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query),
    );
  }, [items, search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage the items in your inventory.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSuccessMessage("");
              setIsCreateFormOpen((open) => !open);
            }}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {isCreateFormOpen ? "Close form" : "+ Create item"}
          </button>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All items</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPending
                ? "Loading inventory..."
                : `${filteredItems.length} of ${(items ?? []).length} items`}
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <label htmlFor="item-search" className="sr-only">
              Search inventory items
            </label>
            <input
              id="item-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search code or item name..."
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {isPending ? (
          <div
            role="status"
            className="p-10 text-center text-sm text-muted-foreground"
          >
            Loading inventory items...
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="font-medium">Unable to load inventory items.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Try again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              {search.trim()
                ? "No matching items found."
                : "No inventory items yet."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search.trim()
                ? "Try a different item code or name."
                : "Items returned by your backend will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Item code
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Reorder level
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Actions
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {item.itemCode}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{item.name}</td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      {item.description || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {item.reorderLevel}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          disabled={itemActionMutation.isPending}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
                        >
                          Edit
                        </button>

                        {item.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Mark "${item.itemCode}" as inactive?`,
                                )
                              ) {
                                itemActionMutation.mutate({
                                  id: item.id,
                                  action: "delete",
                                });
                              }
                            }}
                            disabled={itemActionMutation.isPending}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                itemActionMutation.mutate({
                                  id: item.id,
                                  action: "restore",
                                })
                              }
                              disabled={itemActionMutation.isPending}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
                            >
                              Restore
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Permanently delete "${item.itemCode}"? This cannot be undone.`,
                                );

                                if (confirmed) {
                                  itemActionMutation.mutate({
                                    id: item.id,
                                    action: "permanent-delete",
                                  });
                                }
                              }}
                              disabled={itemActionMutation.isPending}
                              className="inline-flex h-8 items-center justify-center rounded-md border border-destructive/40 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
                            >
                              Permanently Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          className="fixed bottom-4 right-4 z-[60] max-w-md rounded-md border border-destructive/30 bg-background p-4 text-sm text-destructive shadow-lg"
        >
          {actionError}
        </div>
      )}

      {isCreateFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsCreateFormOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-item-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="create-item-title" className="text-lg font-semibold">
                  Create inventory item
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the item details and select a category and unit of
                  measure.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateFormOpen(false)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close create item modal"
              >
                <span aria-hidden="true" className="text-xl">
                  ×
                </span>
              </button>
            </div>

            <CreateInventoryItemForm
              onCancel={() => setIsCreateFormOpen(false)}
              onSuccess={() => {
                setIsCreateFormOpen(false);
                setSuccessMessage("Inventory item created successfully.");
              }}
            />
          </div>
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-item-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="update-item-title" className="text-lg font-semibold">
                  Update inventory item
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit the details for {selectedItem.itemCode}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close update item modal"
              >
                <span aria-hidden="true" className="text-xl">
                  ×
                </span>
              </button>
            </div>

            <UpdateInventoryItemForm
              key={selectedItem.id}
              item={selectedItem}
              onCancel={() => setSelectedItem(null)}
              onSuccess={() => {
                setSelectedItem(null);
                setSuccessMessage("Inventory item updated successfully.");
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
