import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const STATUS_FILTER_VALUES = [
  "all",
  "draft",
  "submitted",
  "approved",
  "changes_requested",
  "published",
  "archived",
] as const;

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

const myProjectsSchema = z.object({
  status: z.enum(STATUS_FILTER_VALUES).default("all"),
});

const adminListSchema = z.object({
  status: z.enum(STATUS_FILTER_VALUES).default("all"),
  includeSoftDeleted: z.boolean().default(false),
});

const projectIdSchema = z.object({ id: z.string().uuid() });

export const listPublishedProjects = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => paginationSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { listPublishedProjectsImpl } = await import(
      "./_internal/projects-queries"
    );
    return listPublishedProjectsImpl(data);
  });

export const listMyProjects = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => myProjectsSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { listMyProjectsImpl } = await import("./_internal/projects-queries");
    return listMyProjectsImpl(data);
  });

export const listAdminProjects = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => adminListSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const { listAdminProjectsImpl } = await import(
      "./_internal/projects-queries"
    );
    return listAdminProjectsImpl(data);
  });

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => projectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { getProjectImpl } = await import("./_internal/projects-queries");
    return getProjectImpl(data);
  });

export const listProjectEditLog = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => projectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { listProjectEditLogImpl } = await import(
      "./_internal/projects-queries"
    );
    return listProjectEditLogImpl(data);
  });

export const listProjectComments = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => projectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { listProjectCommentsImpl } = await import(
      "./_internal/projects-queries"
    );
    return listProjectCommentsImpl(data);
  });
