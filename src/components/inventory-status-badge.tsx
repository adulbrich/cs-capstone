type Status =
  | "available"
  | "requested"
  | "reserved"
  | "checked_out"
  | "maintenance"
  | "retired";

const LABEL: Record<Status, string> = {
  available: "Available",
  requested: "Requested",
  reserved: "Reserved",
  checked_out: "Checked out",
  maintenance: "Maintenance",
  retired: "Retired",
};

export function InventoryStatusBadge({
  status,
  showRetired = false,
}: {
  status: Status;
  showRetired?: boolean;
}) {
  if (status === "retired" && !showRetired) return null;
  const style = STYLES[status];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
      style={style}
    >
      {LABEL[status]}
    </span>
  );
}

const STYLES: Record<Status, React.CSSProperties> = {
  available: {
    background: "color-mix(in srgb, var(--status-success) 15%, transparent)",
    color: "var(--status-success)",
  },
  requested: {
    background: "var(--brand-primary-tint)",
    color: "var(--brand-primary-dark)",
  },
  reserved: {
    background: "color-mix(in srgb, var(--status-warning) 18%, transparent)",
    color: "var(--status-warning)",
  },
  checked_out: {
    background: "var(--surface-sunken)",
    color: "var(--text-primary)",
  },
  maintenance: {
    background: "var(--surface-sunken)",
    color: "var(--text-secondary)",
  },
  retired: {
    background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
    color: "var(--destructive)",
  },
};
