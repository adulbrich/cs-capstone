import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  hardDeleteInventoryItem,
  transitionInventoryItem,
} from "#/server/inventory";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

type Status =
  | "available"
  | "requested"
  | "reserved"
  | "checked_out"
  | "maintenance"
  | "retired";

const ALL_STATUSES: Status[] = [
  "available",
  "requested",
  "reserved",
  "checked_out",
  "maintenance",
  "retired",
];

export type HistoryRow = {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  comment: string | null;
  holderId: string | null;
  holderLabel: string | null;
  createdAt: Date | string;
  changedByName: string | null;
  changedByEmail: string;
};

type Props = {
  item: {
    id: string;
    name: string;
    status: string;
    currentHolderId: string | null;
    currentHolderLabel: string | null;
    currentRequestItemId: string | null;
  };
  holderName?: string | null;
  history: HistoryRow[];
};

function recommendedNext(status: Status): {
  next: Status;
  label: string;
} | null {
  switch (status) {
    case "reserved":
      return { next: "checked_out", label: "Check out" };
    case "checked_out":
      return { next: "available", label: "Return" };
    case "requested":
      return { next: "reserved", label: "Approve / reserve" };
    case "maintenance":
      return { next: "available", label: "Mark available" };
    default:
      return null;
  }
}

const HISTORY_PAGE_SIZE = 10;

function StatusHistorySection({ history }: { history: HistoryRow[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * HISTORY_PAGE_SIZE;
  const slice = history.slice(start, start + HISTORY_PAGE_SIZE);

  return (
    <section>
      <h2 className="text-sm font-medium">Status history</h2>
      {history.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No history.</p>
      ) : (
        <>
          <ul className="mt-2 space-y-2">
            {slice.map((h) => (
              <li
                key={h.id}
                className="rounded-md border border-border bg-card p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {h.oldStatus ? `${h.oldStatus} -> ` : ""}
                    {h.newStatus}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {h.changedByName ?? h.changedByEmail}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString()}
                  </span>
                </div>
                {(h.holderId || h.holderLabel) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Holder: {h.holderLabel ?? h.holderId}
                  </p>
                )}
                {h.comment && (
                  <p className="mt-1 whitespace-pre-wrap">{h.comment}</p>
                )}
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function InventoryLifecyclePanel({ item, holderName, history }: Props) {
  const router = useRouter();
  const status = item.status as Status;
  const rec = recommendedNext(status);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkout / reserve dialog state
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgTargetStatus, setDlgTargetStatus] = useState<Status>("checked_out");
  const [assignMode, setAssignMode] = useState<"user" | "label">("user");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignLabel, setAssignLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dlgComment, setDlgComment] = useState("");

  // Delete dialog state
  const [delOpen, setDelOpen] = useState(false);
  const [delConfirm, setDelConfirm] = useState("");

  // Override "change status to" select
  const [overrideStatus, setOverrideStatus] = useState<Status | "">("");

  async function runTransition(input: {
    nextStatus: Status;
    requestItemId?: string | null;
    holderId?: string | null;
    holderLabel?: string | null;
    pickupBy?: Date | null;
    dueAt?: Date | null;
    comment?: string | null;
  }) {
    setBusy(true);
    setError(null);
    try {
      await transitionInventoryItem({
        data: {
          itemId: item.id,
          nextStatus: input.nextStatus,
          requestItemId: input.requestItemId ?? null,
          holderId: input.holderId ?? null,
          holderLabel: input.holderLabel ?? null,
          pickupBy: input.pickupBy ?? null,
          dueAt: input.dueAt ?? null,
          comment: input.comment ?? null,
        },
      });
      await router.invalidate();
    } catch (e) {
      setError((e as Error)?.message || "Transition failed");
    } finally {
      setBusy(false);
    }
  }

  function openDialogFor(target: Status) {
    setDlgTargetStatus(target);
    setAssignMode("user");
    setAssignUserId(item.currentHolderId ?? "");
    setAssignLabel(item.currentHolderLabel ?? "");
    setDueDate("");
    setPickupDate("");
    setDlgComment("");
    setError(null);
    setDlgOpen(true);
  }

  async function onConfirmDialog() {
    const needsHolder =
      dlgTargetStatus === "reserved" || dlgTargetStatus === "checked_out";
    if (needsHolder && !item.currentRequestItemId) {
      setError(
        "Cannot reserve / check-out from this state; there is no active request line.",
      );
      return;
    }
    const holderId = assignMode === "user" && assignUserId ? assignUserId : null;
    const holderLabel =
      assignMode === "label" && assignLabel ? assignLabel : null;
    if (needsHolder && !holderId && !holderLabel) {
      setError("Provide a user id or a label.");
      return;
    }
    await runTransition({
      nextStatus: dlgTargetStatus,
      requestItemId: needsHolder ? item.currentRequestItemId : null,
      holderId,
      holderLabel,
      pickupBy: pickupDate ? new Date(pickupDate) : null,
      dueAt: dueDate ? new Date(dueDate) : null,
      comment: dlgComment || null,
    });
    setDlgOpen(false);
  }

  async function onRecommendedClick() {
    if (!rec) return;
    if (rec.next === "checked_out" || rec.next === "reserved") {
      openDialogFor(rec.next);
      return;
    }
    await runTransition({ nextStatus: rec.next });
  }

  async function onOverrideChange(v: string) {
    const next = v as Status;
    setOverrideStatus(next);
    if (next === "reserved" || next === "checked_out") {
      openDialogFor(next);
      return;
    }
    if (next === "requested") {
      setError("Cannot directly set 'requested'; use the request queue.");
      setOverrideStatus("");
      return;
    }
    await runTransition({ nextStatus: next });
    setOverrideStatus("");
  }

  async function onHardDelete() {
    setBusy(true);
    setError(null);
    try {
      await hardDeleteInventoryItem({
        data: { id: item.id, confirmName: delConfirm },
      });
      setDelOpen(false);
      // Navigate back to the list.
      window.location.href = "/admin/inventory";
    } catch (e) {
      setError((e as Error)?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const canHardDelete = status === "available" || status === "retired";
  const holderDisplay =
    holderName ?? item.currentHolderLabel ?? (item.currentHolderId ? "(user)" : null);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs uppercase text-muted-foreground">Status</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <InventoryStatusBadge status={status} showRetired />
          <span className="text-xs text-muted-foreground">
            {status.replace(/_/g, " ")}
          </span>
        </div>
        {rec && (
          <div className="mt-3">
            <Button onClick={onRecommendedClick} disabled={busy} size="sm">
              {rec.label}
            </Button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="override-status">Change status to...</Label>
            <Select
              value={overrideStatus || undefined}
              onValueChange={(v) => void onOverrideChange(v)}
            >
              <SelectTrigger
                id="override-status"
                size="sm"
                className="mt-1 w-48"
              >
                <SelectValue placeholder="Pick a status" />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </section>

      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs uppercase text-muted-foreground">Current holder</p>
        <p className="mt-1 text-sm">
          {holderDisplay ? holderDisplay : "(none)"}
        </p>
      </section>

      <StatusHistorySection history={history} />

      <section className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="text-sm font-medium">Danger zone</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hard delete is allowed only when status is available or retired and
          the item has no historical request lines.
        </p>
        <div className="mt-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={!canHardDelete || busy}
            onClick={() => {
              setDelConfirm("");
              setError(null);
              setDelOpen(true);
            }}
          >
            Hard delete item
          </Button>
        </div>
      </section>

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dlgTargetStatus === "checked_out"
                ? "Check out item"
                : "Reserve item"}
            </DialogTitle>
            <DialogDescription>
              Assign the item to a user or to an ad-hoc label.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="assignMode"
                  checked={assignMode === "user"}
                  onChange={() => setAssignMode("user")}
                />
                Assign to user
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="assignMode"
                  checked={assignMode === "label"}
                  onChange={() => setAssignMode("label")}
                />
                Assign to label
              </label>
            </div>
            {assignMode === "user" ? (
              <div>
                <Label htmlFor="assign-user-id">User id</Label>
                <Input
                  id="assign-user-id"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  placeholder="User id"
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="assign-label">Label</Label>
                <Input
                  id="assign-label"
                  value={assignLabel}
                  onChange={(e) => setAssignLabel(e.target.value)}
                  placeholder="e.g. Lab 204"
                  className="mt-1"
                />
              </div>
            )}
            {dlgTargetStatus === "checked_out" && (
              <div>
                <Label htmlFor="due-date">Due date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            {dlgTargetStatus === "reserved" && (
              <div>
                <Label htmlFor="pickup-date">Pickup by</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={dlgComment}
                onChange={(e) => setDlgComment(e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDlgOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={() => void onConfirmDialog()} disabled={busy}>
              {busy ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hard delete item</DialogTitle>
            <DialogDescription>
              This permanently removes the item. Type the item name exactly to
              confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">
              Item name: <span className="font-mono">{item.name}</span>
            </p>
            <Input
              value={delConfirm}
              onChange={(e) => setDelConfirm(e.target.value)}
              placeholder="Type item name to confirm"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDelOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onHardDelete()}
              disabled={busy || delConfirm !== item.name}
            >
              {busy ? "Deleting..." : "Hard delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
