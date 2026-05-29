import { Link } from "@tanstack/react-router";
import { getPublicUrl } from "#/lib/storage";
import { ImageOrFallback } from "./image-or-fallback";
import { InventoryStatusBadge } from "./inventory-status-badge";
import { Button } from "./ui/button";

type Props = {
  item: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status:
      | "available"
      | "requested"
      | "reserved"
      | "checked_out"
      | "maintenance";
  };
  signedIn: boolean;
  onAddToCart?: (itemId: string) => void;
};

export function InventoryCard({ item, signedIn, onAddToCart }: Props) {
  const src = getPublicUrl(item.imageUrl);
  const canAdd = signedIn && item.status === "available" && !!onAddToCart;
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary">
      <Link
        to="/inventory/$itemId"
        params={{ itemId: item.id }}
        className="flex flex-1 flex-col"
      >
        <ImageOrFallback
          src={src}
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-tight">{item.name}</h3>
          {item.description && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          <div className="mt-2">
            <InventoryStatusBadge status={item.status} />
          </div>
        </div>
      </Link>
      {canAdd && (
        <div className="p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAddToCart?.(item.id)}
          >
            Add to cart
          </Button>
        </div>
      )}
    </div>
  );
}
