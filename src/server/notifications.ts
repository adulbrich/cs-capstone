import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const idSchema = z.object({ id: z.string().uuid() });

export const listMyNotifications = createServerFn({ method: "GET" }).handler(
  async () => {
    const { listMyNotificationsImpl } = await import("./notifications.server");
    return listMyNotificationsImpl();
  },
);

export const unreadCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const { unreadCountImpl } = await import("./notifications.server");
    return unreadCountImpl();
  },
);

export const markRead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const { markReadImpl } = await import("./notifications.server");
    return markReadImpl(data);
  });

export const markAllRead = createServerFn({ method: "POST" }).handler(
  async () => {
    const { markAllReadImpl } = await import("./notifications.server");
    return markAllReadImpl();
  },
);
