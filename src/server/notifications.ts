import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { notifications } from "#/db/schema";
import { requireUser } from "#/lib/auth-guards.server";

export const listMyNotifications = createServerFn({ method: "GET" }).handler(
  async () => {
    const viewer = await requireUser();
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, viewer.id))
      .orderBy(desc(notifications.createdAt))
      .limit(10);
    return { rows };
  },
);

export const unreadCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const viewer = await requireUser();
    const [{ value }] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, viewer.id), eq(notifications.read, false)),
      );
    return { count: value };
  },
);

const idSchema = z.object({ id: z.string().uuid() });

export const markRead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const viewer = await requireUser();
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.id, data.id), eq(notifications.userId, viewer.id)),
      );
    return { id: data.id };
  });

export const markAllRead = createServerFn({ method: "POST" }).handler(
  async () => {
    const viewer = await requireUser();
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, viewer.id));
    return { ok: true };
  },
);
