import { sql } from "drizzle-orm";
import { db } from "#/db";

const TABLES = [
  "notifications",
  "inventory_requests",
  "inventory_items",
  "project_bookmarks",
  "project_assignments",
  "project_bids",
  "project_status_history",
  "project_comments",
  "project_collaborators",
  "project_categories",
  "projects",
  "categories",
  "program_instructors",
  "programs",
  "verification",
  "account",
  "session",
  "user",
];

export async function resetDatabase() {
  for (const t of TABLES) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${t}" CASCADE;`));
  }
}
