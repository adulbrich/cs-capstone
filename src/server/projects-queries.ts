import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import {
  projectComments,
  projectEditLog,
  projectStatusHistory,
  projects,
} from "#/db/schema";
import { readSession } from "#/lib/auth-guards.server";
import {
  canSeeProject,
  filterCommentsForViewer,
  isStaff,
  stripStaffOnlyFields,
  type Viewer,
} from "#/lib/project-visibility";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

async function getViewer(): Promise<Viewer> {
  const session = await readSession();
  return session?.user
    ? { id: session.user.id, role: session.user.role ?? null }
    : null;
}

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const listPublishedProjects = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => paginationSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const offset = (data.page - 1) * data.pageSize;
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.status, "published"), isNull(projects.deletedAt)))
      .orderBy(desc(projects.publishedAt))
      .limit(data.pageSize)
      .offset(offset);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(eq(projects.status, "published"), isNull(projects.deletedAt)));
    return { rows, total: count, page: data.page, pageSize: data.pageSize };
  });

const STATUS_FILTER_VALUES = [
  "all",
  "draft",
  "submitted",
  "approved",
  "changes_requested",
  "published",
  "archived",
] as const;

const myProjectsSchema = z.object({
  status: z.enum(STATUS_FILTER_VALUES).default("all"),
});

export const listMyProjects = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => myProjectsSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const viewer = await getViewer();
    if (!viewer) return { rows: [] };
    const conditions = [
      eq(projects.proposerId, viewer.id),
      isNull(projects.deletedAt),
    ];
    if (data.status !== "all") {
      conditions.push(eq(projects.status, data.status));
    }
    const rows = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt));
    return { rows };
  });

const adminListSchema = z.object({
  status: z.enum(STATUS_FILTER_VALUES).default("all"),
  includeSoftDeleted: z.boolean().default(false),
});

export const listAdminProjects = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => adminListSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const viewer = await getViewer();
    if (!isStaff(viewer)) throw new Error("Forbidden");
    const conditions = [];
    if (data.status !== "all") {
      conditions.push(eq(projects.status, data.status));
    }
    if (!data.includeSoftDeleted) {
      conditions.push(isNull(projects.deletedAt));
    }
    const rows = await db
      .select()
      .from(projects)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(projects.updatedAt));
    return { rows };
  });

const getProjectSchema = z.object({ id: z.string().uuid() });

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getProjectSchema.parse(data))
  .handler(async ({ data }) => {
    const viewer = await getViewer();
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.id));
    if (!project) {
      return {
        project: null,
        history: [],
        canEdit: false,
        viewerIsStaff: false,
      };
    }
    if (!canSeeProject(project, viewer)) {
      return {
        project: null,
        history: [],
        canEdit: false,
        viewerIsStaff: false,
      };
    }

    const stripped = stripStaffOnlyFields(project, viewer);
    const history = await db
      .select({
        id: projectStatusHistory.id,
        oldStatus: projectStatusHistory.oldStatus,
        newStatus: projectStatusHistory.newStatus,
        changedBy: projectStatusHistory.changedBy,
        comment: projectStatusHistory.comment,
        createdAt: projectStatusHistory.createdAt,
      })
      .from(projectStatusHistory)
      .where(eq(projectStatusHistory.projectId, data.id))
      .orderBy(asc(projectStatusHistory.createdAt));

    const viewerIsStaff = isStaff(viewer);
    const canEdit =
      !!viewer &&
      !project.deletedAt &&
      (viewerIsStaff || project.proposerId === viewer.id) &&
      project.status !== "archived";

    return {
      project: stripped,
      history,
      canEdit,
      viewerIsStaff,
    };
  });

const projectIdSchema = z.object({ id: z.string().uuid() });

export const listProjectEditLog = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => projectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const viewer = await getViewer();
    if (!isStaff(viewer)) throw new Error("Forbidden");
    const rows = await db
      .select()
      .from(projectEditLog)
      .where(eq(projectEditLog.projectId, data.id))
      .orderBy(desc(projectEditLog.createdAt));
    return {
      rows: rows.map((r) => ({
        ...r,
        oldValues: r.oldValues as JsonValue,
        newValues: r.newValues as JsonValue,
      })),
    };
  });

export const listProjectComments = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => projectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const viewer = await getViewer();
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.id));
    if (!project || !canSeeProject(project, viewer)) {
      throw new Error("Forbidden");
    }
    const rows = await db
      .select()
      .from(projectComments)
      .where(eq(projectComments.projectId, data.id))
      .orderBy(asc(projectComments.createdAt));
    return { rows: filterCommentsForViewer(rows, viewer) };
  });
