CREATE UNIQUE INDEX "notifications_overdue_unique_idx"
  ON "notifications" ("user_id", "type", "link")
  WHERE "type" IN ('inventory_pickup_overdue', 'inventory_checkout_overdue');
