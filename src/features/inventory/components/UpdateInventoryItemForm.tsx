
import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  updateInventoryItem,
  type UpdateInventoryItemRequest,
} from "@/features/inventory/api/inventory-api"
import { useInventoryCategories } from "@/features/inventory/hooks/use-inventory-categories"
import { useUnitsOfMeasure } from "@/features/inventory/hooks/use-units-of-measure"
import { ApiError } from "@/services/api-error"
import type { InventoryItem } from "@/features/inventory/types/inventory-item"
import {
  updateInventoryItemSchema,
  type UpdateInventoryItemFormValues,
} from "@/features/inventory/schemas/inventory-item-schema"

type UpdateInventoryItemFormProps = {
  item: InventoryItem
  onSuccess: () => void
  onCancel: () => void
}

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"

const labelClassName = "text-sm font-medium"
const errorClassName = "text-sm text-destructive"

export default function UpdateInventoryItemForm({
  item,
  onSuccess,
  onCancel,
}: UpdateInventoryItemFormProps) {
  const queryClient = useQueryClient()
  const categoriesQuery = useInventoryCategories()
  const unitsQuery = useUnitsOfMeasure()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateInventoryItemFormValues>({
    resolver: zodResolver(updateInventoryItemSchema),
    defaultValues: {
      name: item.name,
      categoryId: item.categoryId,
      unitOfMeasureId: item.unitOfMeasureId,
      description: item.description ?? "",
      reorderLevel: item.reorderLevel,
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: UpdateInventoryItemRequest) =>
      updateInventoryItem(item.id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory", "items"],
      })
      onSuccess()
    },
  })

  const { reset: resetUpdateMutation } = updateMutation

  useEffect(() => {
    if (!updateMutation.isError) return

    const timeoutId = window.setTimeout(() => {
      resetUpdateMutation()
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [updateMutation.isError, resetUpdateMutation])

  const onSubmit: SubmitHandler<UpdateInventoryItemFormValues> = (
    values,
  ) => {
    updateMutation.mutate({
      ...values,
      description: values.description.trim() || null,
    })
  }

  const categoryError = categoriesQuery.isError
    ? categoriesQuery.error instanceof ApiError
      ? categoriesQuery.error.message
      : "Unable to load categories."
    : ""

  const unitError = unitsQuery.isError
    ? unitsQuery.error instanceof ApiError
      ? unitsQuery.error.message
      : "Unable to load units of measure."
    : ""

  const formError = updateMutation.isError
    ? updateMutation.error instanceof ApiError
      ? updateMutation.error.message
      : "Unable to update the inventory item."
    : ""

  const optionsLoading =
    categoriesQuery.isPending || unitsQuery.isPending

  const hasActiveCategory = (categoriesQuery.data ?? []).some(
    (category) => category.isActive,
  )

  const hasActiveUnit = (unitsQuery.data ?? []).some(
    (unit) => unit.isActive,
  )

  const isBusy = updateMutation.isPending || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="update-item-code" className={labelClassName}>
            Item code
          </label>
          <input
            id="update-item-code"
            value={item.itemCode}
            readOnly
            className={`${inputClassName} cursor-not-allowed bg-muted`}
          />
          <p className="text-xs text-muted-foreground">
            Item code cannot be changed here.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="update-item-name" className={labelClassName}>
            Item name *
          </label>
          <input
            id="update-item-name"
            {...register("name")}
            className={inputClassName}
            placeholder="Enter item name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className={errorClassName}>{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="update-category-id"
            className={labelClassName}
          >
            Category *
          </label>
          <select
            id="update-category-id"
            {...register("categoryId")}
            className={inputClassName}
            disabled={optionsLoading || categoriesQuery.isError}
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">Select a category</option>
            {(categoriesQuery.data ?? [])
              .filter(
                (category) =>
                  category.isActive || category.id === item.categoryId,
              )
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.code} — {category.name}
                  {!category.isActive ? " (Inactive)" : ""}
                </option>
              ))}
          </select>
          {errors.categoryId && (
            <p className={errorClassName}>
              {errors.categoryId.message}
            </p>
          )}
          {categoryError && (
            <p className={errorClassName}>{categoryError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="update-unit-id"
            className={labelClassName}
          >
            Unit of measure *
          </label>
          <select
            id="update-unit-id"
            {...register("unitOfMeasureId")}
            className={inputClassName}
            disabled={optionsLoading || unitsQuery.isError}
            aria-invalid={Boolean(errors.unitOfMeasureId)}
          >
            <option value="">Select a unit</option>
            {(unitsQuery.data ?? [])
              .filter(
                (unit) =>
                  unit.isActive || unit.id === item.unitOfMeasureId,
              )
              .map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.code} — {unit.name}
                  {!unit.isActive ? " (Inactive)" : ""}
                </option>
              ))}
          </select>
          {errors.unitOfMeasureId && (
            <p className={errorClassName}>
              {errors.unitOfMeasureId.message}
            </p>
          )}
          {unitError && (
            <p className={errorClassName}>{unitError}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="update-description"
            className={labelClassName}
          >
            Description
          </label>
          <textarea
            id="update-description"
            {...register("description")}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Optional item description"
          />
          {errors.description && (
            <p className={errorClassName}>
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="update-reorder-level"
            className={labelClassName}
          >
            Reorder level *
          </label>
          <input
            id="update-reorder-level"
            type="number"
            min="0"
            step="any"
            {...register("reorderLevel", { valueAsNumber: true })}
            className={inputClassName}
            aria-invalid={Boolean(errors.reorderLevel)}
          />
          {errors.reorderLevel && (
            <p className={errorClassName}>
              {errors.reorderLevel.message}
            </p>
          )}
        </div>
      </div>

      {optionsLoading && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading categories and units of measure...
        </p>
      )}

      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isBusy ||
            optionsLoading ||
            categoriesQuery.isError ||
            unitsQuery.isError ||
            !hasActiveCategory ||
            !hasActiveUnit
          }
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  )
}
