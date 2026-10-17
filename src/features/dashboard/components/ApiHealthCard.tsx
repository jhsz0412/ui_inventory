import {
  Activity,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";
import { useApiHealth } from "@/features/dashboard/hooks/use-api-health";

export default function ApiHealthCard() {
  const { data, isPending, isError } = useApiHealth();

  return (
    <section className="rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2">
          <Activity className="size-5" />
        </div>

        <div>
          <h2 className="font-semibold">API connection status</h2>
          <p className="text-sm text-muted-foreground">
            Backend service health
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            <span>Checking connection…</span>
          </>
        ) : isError ? (
          <>
            <CircleAlert className="size-4 text-destructive" />
            <span>Unable to reach the API</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Connected — {data.status}</span>
          </>
        )}
      </div>

      {data && (
        <p className="mt-2 text-xs text-muted-foreground">{data.application}</p>
      )}
    </section>
  );
}
