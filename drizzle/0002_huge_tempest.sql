ALTER TABLE "projects" DROP CONSTRAINT "projects_program_id_programs_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(problem_statement, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(objectives, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(min_qualifications, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(pref_qualifications, '')), 'C')
  ) STORED;
--> statement-breakpoint
CREATE INDEX "projects_search_idx" ON "projects" USING GIN ("search_vector");
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
