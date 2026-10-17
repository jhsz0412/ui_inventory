import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/services/api-error"
import { createInventoryItem } from "@/features/inventory/api/inventory-api"
import { useInventoryCategories } from "@/features/inventory/hooks/use-inventory-categories"
import { useUnitsOfMeasure } from "@/features/inventory/hooks/use-units-of-measure"

import {
  inventoryItemSchema,
  type InventoryItemFormValues,
} from "@/features/inventory/schemas/inventory-item-schema"

type CreateInventoryItemFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"

const labelClassName = "text-sm font-medium"

const errorClassName = "text-sm text-destructive"

export default function CreateInventoryItemForm({
  onSuccess,
  onCancel,
}: CreateInventoryItemFormProps) {
  const queryClient = useQueryClient()
  const categoriesQuery = useInventoryCategories()
  const unitsQuery = useUnitsOfMeasure()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      itemCode: "",
      name: "",
      categoryId: "",
      unitOfMeasureId: "",
      description: "",
      reorderLevel: 0,
    },
  })

  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory", "items"],
      })
      onSuccess()
    },
  })

  const { reset: resetCreateMutation } = createMutation

useEffect(() => {
  if (!createMutation.isError) return

  const timeoutId = window.setTimeout(() => {
    resetCreateMutation()
  }, 3000)

  return () => {
    window.clearTimeout(timeoutId)
  }
}, [createMutation.isError, resetCreateMutation])

  const onSubmit: SubmitHandler<InventoryItemFormValues> = (values) => {
    createMutation.mutate({
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

  const formError = createMutation.isError
    ? createMutation.error instanceof ApiError
      ? createMutation.error.message
      : "Unable to create the inventory item."
    : ""

  const optionsLoading =
    categoriesQuery.isPending || unitsQuery.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="itemCode" className={labelClassName}>
            Item code *
          </label>
          <input
            id="itemCode"
            {...register("itemCode")}
            className={inputClassName}
            placeholder="e.g. PEN-BLUE-001"
            aria-invalid={Boolean(errors.itemCode)}
          />
          {errors.itemCode && (
            <p className={errorClassName}>{errors.itemCode.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className={labelClassName}>
            Item name *
          </label>
          <input
            id="name"
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
          <label htmlFor="categoryId" className={labelClassName}>
            Category *
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className={inputClassName}
            disabled={optionsLoading || categoriesQuery.isError}
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">Select a category</option>
            {(categoriesQuery.data ?? [])
              .filter((category) => category.isActive)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.code} — {category.name}
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
            htmlFor="unitOfMeasureId"
            className={labelClassName}
          >
            Unit of measure *
          </label>
          <select
            id="unitOfMeasureId"
            {...register("unitOfMeasureId")}
            className={inputClassName}
            disabled={optionsLoading || unitsQuery.isError}
            aria-invalid={Boolean(errors.unitOfMeasureId)}
          >
            <option value="">Select a unit</option>
            {(unitsQuery.data ?? [])
              .filter((unit) => unit.isActive)
              .map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.code} — {unit.name}
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
          <label htmlFor="description" className={labelClassName}>
            Description
          </label>
          <textarea
            id="description"
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
          <label htmlFor="reorderLevel" className={labelClassName}>
            Reorder level *
          </label>
          <input
            id="reorderLevel"
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
          disabled={createMutation.isPending || isSubmitting}
          className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            createMutation.isPending ||
            isSubmitting ||
            optionsLoading ||
            categoriesQuery.isError ||
            unitsQuery.isError ||
            !categoriesQuery.data?.some((category) => category.isActive) ||
            !unitsQuery.data?.some((unit) => unit.isActive)
          }
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createMutation.isPending || isSubmitting
            ? "Creating..."
            : "Create item"}
        </button>
      </div>
    </form>
  )
}
