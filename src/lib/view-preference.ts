export type ViewMode = "card" | "row";

/**
 * Shared localStorage key for the card/row list view. One preference is applied
 * across the Projects and public Inventory pages by design.
 */
export const VIEW_STORAGE_KEY = "cs-capstone:view-mode";

function isViewMode(value: unknown): value is ViewMode {
  return value === "card" || value === "row";
}

/**
 * Reads the persisted view preference. Returns null when running without a
 * DOM (SSR), when nothing is stored, or when the stored value is not a valid
 * view mode. Never throws.
 */
export function readStoredView(): ViewMode | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return isViewMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Persists the view preference. A no-op (never throws) when storage is
 * unavailable.
 */
export function writeStoredView(view: ViewMode): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // Ignore: storage may be full or disabled (private mode).
  }
}
