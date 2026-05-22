CREATE TYPE "public"."inventory_item_status" AS ENUM('available', 'requested', 'reserved', 'checked_out', 'maintenance', 'retired');--> statement-breakpoint
CREATE TYPE "public"."inventory_request_item_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled', 'returned');--> statement-breakpoint
CREATE TABLE "inventory_cart_items" (
	"user_id" text NOT NULL,
	"item_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_cart_items_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_item_edit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"editor_id" text NOT NULL,
	"changed_fields" text[] NOT NULL,
	"old_values" jsonb NOT NULL,
	"new_values" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_item_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"old_status" "inventory_item_status",
	"new_status" "inventory_item_status" NOT NULL,
	"changed_by" text NOT NULL,
	"comment" text,
	"request_item_id" uuid,
	"holder_id" text,
	"holder_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"status" "inventory_request_item_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"review_comment" text,
	"pickup_by" timestamp with time zone,
	"due_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"closed_by" text,
	"closed_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP CONSTRAINT "inventory_requests_item_id_inventory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP CONSTRAINT "inventory_requests_reviewed_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "serial" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "status" "inventory_item_status" DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "current_holder_id" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "current_holder_label" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "current_request_item_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(name, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B') || setweight(to_tsvector('english', coalesce(category, '')), 'C')) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_requests" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "inventory_cart_items" ADD CONSTRAINT "inventory_cart_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_cart_items" ADD CONSTRAINT "inventory_cart_items_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_edit_log" ADD CONSTRAINT "inventory_item_edit_log_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_edit_log" ADD CONSTRAINT "inventory_item_edit_log_editor_id_user_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_status_history" ADD CONSTRAINT "inventory_item_status_history_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_status_history" ADD CONSTRAINT "inventory_item_status_history_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_status_history" ADD CONSTRAINT "inventory_item_status_history_request_item_id_inventory_request_items_id_fk" FOREIGN KEY ("request_item_id") REFERENCES "public"."inventory_request_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item_status_history" ADD CONSTRAINT "inventory_item_status_history_holder_id_user_id_fk" FOREIGN KEY ("holder_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_request_items" ADD CONSTRAINT "inventory_request_items_request_id_inventory_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."inventory_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_request_items" ADD CONSTRAINT "inventory_request_items_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_request_items" ADD CONSTRAINT "inventory_request_items_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_request_items" ADD CONSTRAINT "inventory_request_items_closed_by_user_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_item_edit_log_item_idx" ON "inventory_item_edit_log" USING btree ("item_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_item_status_history_item_idx" ON "inventory_item_status_history" USING btree ("item_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_request_items_request_idx" ON "inventory_request_items" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "inventory_request_items_item_idx" ON "inventory_request_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "inventory_request_items_status_idx" ON "inventory_request_items" USING btree ("status");--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_current_holder_id_user_id_fk" FOREIGN KEY ("current_holder_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_items_status_idx" ON "inventory_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_items_category_idx" ON "inventory_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "inventory_items_current_holder_idx" ON "inventory_items" USING btree ("current_holder_id");--> statement-breakpoint
CREATE INDEX "inventory_requests_user_created_idx" ON "inventory_requests" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "inventory_items" DROP COLUMN "reorder_threshold";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "item_id";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "reason";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "reviewed_by";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "review_comment";--> statement-breakpoint
ALTER TABLE "inventory_requests" DROP COLUMN "reviewed_at";--> statement-breakpoint
DROP TYPE "public"."inventory_request_status";--> statement-breakpoint
-- Deferred FK from inventory_items.current_request_item_id to inventory_request_items.id
ALTER TABLE "inventory_items"
  ADD CONSTRAINT "inventory_items_current_request_item_id_fk"
  FOREIGN KEY ("current_request_item_id")
  REFERENCES "inventory_request_items"("id")
  ON DELETE SET NULL;
--> statement-breakpoint
-- GIN index on the generated tsvector column for full-text search
CREATE INDEX "inventory_items_search_vector_idx"
  ON "inventory_items" USING GIN ("search_vector");