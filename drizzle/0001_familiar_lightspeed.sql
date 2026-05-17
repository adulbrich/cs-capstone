CREATE TABLE "project_edit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"editor_id" text NOT NULL,
	"changed_fields" text[] NOT NULL,
	"old_values" jsonb NOT NULL,
	"new_values" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_comments" DROP CONSTRAINT "project_comments_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_status_history" DROP CONSTRAINT "project_status_history_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_edit_log" ADD CONSTRAINT "project_edit_log_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_edit_log" ADD CONSTRAINT "project_edit_log_editor_id_user_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_edit_log_project_idx" ON "project_edit_log" USING btree ("project_id","created_at");--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_parent_id_project_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_read_created_idx" ON "notifications" USING btree ("user_id","read","created_at");--> statement-breakpoint
CREATE INDEX "project_comments_project_idx" ON "project_comments" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "project_status_history_project_idx" ON "project_status_history" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_deleted_at_idx" ON "projects" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "projects_proposer_id_idx" ON "projects" USING btree ("proposer_id");--> statement-breakpoint
CREATE INDEX "projects_program_id_idx" ON "projects" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "projects_published_at_idx" ON "projects" USING btree ("published_at");