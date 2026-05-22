import { Link } from "@tanstack/react-router";
import { InventoryStatusBadge } from "./inventory-status-badge";

type Props = {
  item: {
    id: string;
    name: string;
    category: string | null;
    location: string | null;
    status:
      | "available"
      | "requested"
      | "reserved"
      | "checked_out"
      | "maintenance";
  };
};

export function InventoryRow({ item }: Props) {
  return (
    <Link
      to="/inventory/$itemId"
      params={{ itemId: item.id }}
      className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 hover:bg-secondary"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{item.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.category} {item.location ? `· ${item.location}` : ""}
        </p>
      </div>
      <InventoryStatusBadge status={item.status} />
    </Link>
  );
}
