
import {
  Activity,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Package,
  Plus,
  Warehouse,
} from "lucide-react"
import { Link } from "react-router-dom"
import ApiHealthCard from "@/features/dashboard/components/ApiHealthCard"

const metrics = [
  {
    label: "Total items",
    icon: Package,
    description: "Registered inventory items",
  },
  {
    label: "Stock on hand",
    icon: Boxes,
    description: "Current inventory balance",
  },
  {
    label: "Low-stock items",
    icon: Activity,
    description: "Items needing attention",
  },
  {
    label: "Open requisitions",
    icon: ClipboardList,
    description: "Requests in progress",
  },
]

const quickLinks = [
  {
    label: "Browse inventory items",
    description: "View registered items",
    icon: Package,
    path: "/inventory/items",
  },
  {
    label: "Manage warehouses",
    description: "View storage facilities",
    icon: Warehouse,
    path: "/inventory/warehouses",
  },
  {
    label: "Review requisitions",
    description: "View inventory requests",
    icon: ClipboardList,
    path: "/requisitions",
  },
  {
    label: "View reports",
    description: "Inventory and stock summaries",
    icon: BarChart3,
    path: "/reports",
  },
]

export default function DashboardPage() {
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-primary">OVERVIEW</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Inventory dashboard
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Monitor your inventory, stock movements, and operational requests
            in one place.
          </p>
        </div>

        <Link
          to="/inventory/items"
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
        >
          <Plus size={17} />
          Explore items
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <section
              key={metric.label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </span>
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon size={18} />
                </span>
              </div>

              <p className="text-3xl font-semibold tracking-tight">—</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {metric.description}
              </p>
            </section>
          )
        })}
      </div>

      <div className="mb-6">
        <ApiHealthCard />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold">Stock movement</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Inventory activity over time
              </p>
            </div>

            <Link
              to="/inventory/stock-movements"
              className="text-sm font-medium text-primary hover:underline"
            >
              View movements
            </Link>
          </div>

          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Activity size={23} />
            </span>
            <p className="text-sm font-medium">
              Movement data will appear here
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              Connect the inventory API to display stock receipts, issues,
              transfers, and adjustments.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold">Quick access</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Common inventory tasks
              </p>
            </div>
            <Boxes size={19} className="text-muted-foreground" />
          </div>

          <div className="space-y-1 p-3">
            {quickLinks.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/70"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                    <Icon size={18} className="text-muted-foreground" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>

                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground"
                  />
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-border bg-card">
        <div className="flex flex-col justify-between gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">Recent transactions</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              The latest changes to inventory balances
            </p>
          </div>

          <Link
            to="/inventory/stock-movements"
            className="self-start text-sm font-medium text-primary hover:underline sm:self-auto"
          >
            View all transactions
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ArrowLeftRight size={20} />
          </span>
          <p className="text-sm font-medium">No transactions loaded</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Transaction records will appear after API integration.
          </p>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>Inventory Management System</p>
        <p className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-amber-500" />
          Waiting for inventory data
        </p>
      </div>
    </>
  )
}
