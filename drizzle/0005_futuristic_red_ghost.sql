ALTER TABLE "projects" DROP CONSTRAINT "projects_proposer_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "proposer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "proposer_email" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_proposer_id_user_id_fk" FOREIGN KEY ("proposer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_proposer_email_idx" ON "projects" USING btree ("proposer_email");