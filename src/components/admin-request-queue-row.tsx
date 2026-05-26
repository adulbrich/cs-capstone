import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { approveRequestItem, rejectRequestItem } from "#/server/inventory";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Props = {
  line: {
    id: string;
    status: string;
  };
  item: {
    id: string;
    name: string;
    status: string;
  };
};

export function AdminRequestQueueRow({ line, item }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "approve" | "reject">(null);
  const [pickupBy, setPickupBy] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPending = line.status === "pending";

  async function onApprove() {
    setBusy(true);
    setError(null);
    try {
      await approveRequestItem({
        data: {
          requestItemId: line.id,
          pickupBy: pickupBy ? new Date(pickupBy) : null,
        },
      });
      setMode(null);
      setPickupBy("");
      await router.invalidate();
    } catch (e) {
      setError((e as Error)?.message || "Approve failed");
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    if (!reason.trim()) {
      setError("Reason required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rejectRequestItem({
        data: { requestItemId: line.id, reviewComment: reason },
      });
      setMode(null);
      setReason("");
      await router.invalidate();
    } catch (e) {
      setError((e as Error)?.message || "Reject failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <InventoryStatusBadge status={item.status as "available"} />
            <span>line: {line.status}</span>
          </div>
        </div>
        {isPending && mode === null && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setMode("approve")}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMode("reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      {mode === "approve" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label
              htmlFor={`pickup-${line.id}`}
              className="text-xs text-muted-foreground"
            >
              Pickup by (optional)
            </label>
            <Input
              id={`pickup-${line.id}`}
              type="date"
              value={pickupBy}
              onChange={(e) => setPickupBy(e.target.value)}
              className="mt-1 w-40"
            />
          </div>
          <Button size="sm" onClick={() => void onApprove()} disabled={busy}>
            {busy ? "Saving..." : "Confirm approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMode(null);
              setError(null);
            }}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      )}

      {mode === "reject" && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (sent to requester)"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => void onReject()}
              disabled={busy}
            >
              {busy ? "Saving..." : "Confirm reject"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setMode(null);
                setError(null);
              }}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
