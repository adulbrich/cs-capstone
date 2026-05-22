import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { getPublicUrl } from "#/lib/storage";

type Props = {
  item: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    location: string | null;
    imageUrl: string | null;
    status:
      | "available"
      | "requested"
      | "reserved"
      | "checked_out"
      | "maintenance";
    pickupOverdue?: boolean;
    checkoutOverdue?: boolean;
  };
  signedIn: boolean;
  onAddToCart?: (itemId: string) => void;
};

export function InventoryCard({ item, signedIn, onAddToCart }: Props) {
  const img = getPublicUrl(item.imageUrl);
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <Link to="/inventory/$itemId" params={{ itemId: item.id }} className="block">
        <div className="aspect-video w-full overflow-hidden rounded bg-(--surface-sunken)">
          {img ? (
            <img src={img} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <h3 className="mt-2 font-semibold leading-tight">{item.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <InventoryStatusBadge status={item.status} />
          {item.pickupOverdue && (
            <span
              className="rounded px-2 py-0.5 text-xs"
              style={{
                background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                color: "var(--destructive)",
              }}
            >
              Past pickup window
            </span>
          )}
          {item.checkoutOverdue && (
            <span
              className="rounded px-2 py-0.5 text-xs"
              style={{
                background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                color: "var(--destructive)",
              }}
            >
              Overdue
            </span>
          )}
          {item.category && (
            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {item.category}
            </span>
          )}
        </div>
        {item.location && (
          <p className="mt-1 text-xs text-muted-foreground">{item.location}</p>
        )}
      </Link>
      {signedIn && item.status === "available" && onAddToCart && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onAddToCart(item.id)}
        >
          Add to cart
        </Button>
      )}
    </div>
  );
}
