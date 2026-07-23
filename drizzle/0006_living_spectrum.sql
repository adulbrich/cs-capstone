CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "user_interests" (
	"user_id" text PRIMARY KEY NOT NULL,
	"interests_text" text NOT NULL,
	"embedding" vector(1024),
	"embedding_source_hash" text,
	"embedding_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "embedding" vector(1024);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "embedding_source_hash" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "embedding_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_embedding_idx" ON "projects" USING hnsw ("embedding" vector_cosine_ops);