import { useState } from "react";
import { banUser, unbanUser } from "#/server/users";

type Props = {
  userId: string;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | string | null;
  onChanged: () => void;
};

export function BanForm({
  userId,
  banned,
  banReason,
  banExpires,
  onChanged,
}: Props) {
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onBan() {
    setBusy(true);
    setError(null);
    try {
      const expires = expiresAt.length > 0 ? new Date(expiresAt) : null;
      await banUser({
        data: { userId, reason, expiresAt: expires },
      });
      setReason("");
      setExpiresAt("");
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onUnban() {
    setBusy(true);
    setError(null);
    try {
      await unbanUser({ data: { userId } });
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (banned) {
    const expiresDisplay = banExpires
      ? new Date(banExpires).toLocaleString()
      : "permanent";
    return (
      <section className="mt-4 border-2 border-red-300 bg-red-50 p-3 dark:bg-red-950">
        <h2 className="font-medium text-sm">Banned</h2>
        <p className="mt-1 text-sm">
          <span className="text-neutral-500">Reason: </span>
          {banReason ?? "(none)"}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-neutral-500">Expires: </span>
          {expiresDisplay}
        </p>
        <button
          type="button"
          onClick={() => void onUnban()}
          disabled={busy}
          className="mt-3 border border-neutral-300 px-3 py-1.5 text-sm hover:bg-white disabled:opacity-50"
        >
          {busy ? "Working..." : "Unban"}
        </button>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </section>
    );
  }

  return (
    <section className="mt-4">
      <h2 className="font-medium text-sm">Ban this user</h2>
      <div className="mt-2 space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required)"
          required
          rows={3}
          className="w-full border p-2"
        />
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="border p-2"
        />
        <p className="text-xs text-neutral-500">
          Leave expiry blank for permanent.
        </p>
        <button
          type="button"
          onClick={() => void onBan()}
          disabled={busy || reason.trim().length === 0}
          className="border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {busy ? "Working..." : "Ban"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </section>
  );
}
