import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "#/db";
import { inventoryRequestItems, projects, user } from "#/db/schema";
import { requireUser } from "#/lib/_internal/auth-guards";
import { isStaff } from "#/lib/project-visibility";

function count() {
  return sql<number>`count(*)::int`;
}

export const getAdminStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const viewer = await requireUser();
    if (!isStaff({ id: viewer.id, role: viewer.role ?? null })) {
      throw new Error("Forbidden");
    }

    const [
      [{ total }],
      [{ published }],
      [{ submitted }],
      [{ userTotal }],
      [{ pendingRequests }],
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(projects)
        .where(isNull(projects.deletedAt)),
      db
        .select({ published: count() })
        .from(projects)
        .where(
          and(sql`${projects.status} = 'published'`, isNull(projects.deletedAt))
        ),
      db
        .select({ submitted: count() })
        .from(projects)
        .where(
          and(sql`${projects.status} = 'submitted'`, isNull(projects.deletedAt))
        ),
      db.select({ userTotal: count() }).from(user),
      // Distinct requests with at least one pending line, matching the number
      // of cards shown on /admin/inventory/requests?tab=pending.
      db
        .select({
          pendingRequests: sql<number>`count(distinct ${inventoryRequestItems.requestId})::int`,
        })
        .from(inventoryRequestItems)
        .where(eq(inventoryRequestItems.status, "pending")),
    ]);

    return { total, published, submitted, userTotal, pendingRequests };
  }
);
