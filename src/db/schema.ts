import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

// Enums
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "submitted",
  "approved",
  "changes_requested",
  "published",
  "archived",
]);
export const inventoryRequestStatusEnum = pgEnum("inventory_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: text("course_id").notNull(),
  courseName: text("course_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const programInstructors = pgTable(
  "program_instructors",
  {
    programId: uuid("program_id")
      .references(() => programs.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.programId, t.userId] })],
);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'project_type', 'technology', 'industry', 'field'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    problemStatement: text("problem_statement"),
    objectives: text("objectives"),
    minQualifications: text("min_qualifications"),
    prefQualifications: text("pref_qualifications"),
    url: text("url"),
    contactEmail: text("contact_email"),
    contactName: text("contact_name"),
    imageUrl: text("image_url"),
    licenseRestrictions: text("license_restrictions"),
    /** Staff-visible only; never returned in public queries. */
    notes: text("notes"),

    proposerId: text("proposer_id")
      .references(() => user.id, { onDelete: "restrict" })
      .notNull(),
    programId: uuid("program_id").references(() => programs.id),
    programManagerId: text("program_manager_id").references(() => user.id, {
      onDelete: "restrict",
    }),

    status: projectStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("projects_status_idx").on(t.status),
    index("projects_deleted_at_idx").on(t.deletedAt),
    index("projects_proposer_id_idx").on(t.proposerId),
    index("projects_program_id_idx").on(t.programId),
    index("projects_published_at_idx").on(t.publishedAt),
  ],
);

export const projectCategories = pgTable(
  "project_categories",
  {
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.categoryId] })],
);

export const projectCollaborators = pgTable(
  "project_collaborators",
  {
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").default("collaborator"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);

export const projectComments = pgTable(
  "project_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    authorId: text("author_id")
      .references(() => user.id, { onDelete: "restrict" })
      .notNull(),
    parentId: uuid("parent_id").references(
      (): import("drizzle-orm/pg-core").AnyPgColumn => projectComments.id,
      { onDelete: "cascade" },
    ),
    content: text("content").notNull(),
    isInternal: boolean("is_internal").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("project_comments_project_idx").on(t.projectId, t.createdAt)],
);

export const projectStatusHistory = pgTable(
  "project_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    oldStatus: projectStatusEnum("old_status"),
    newStatus: projectStatusEnum("new_status").notNull(),
    changedBy: text("changed_by")
      .references(() => user.id, { onDelete: "restrict" })
      .notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("project_status_history_project_idx").on(t.projectId, t.createdAt),
  ],
);

export const projectBids = pgTable("project_bids", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  studentId: text("student_id")
    .references(() => user.id, { onDelete: "restrict" })
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  motivation: text("motivation").notNull(),
  qualifications: text("qualifications"),
  rank: integer("rank").notNull(), // 1-5 preference
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projectAssignments = pgTable("project_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  studentId: text("student_id")
    .references(() => user.id, { onDelete: "restrict" })
    .notNull(),
  assignedBy: text("assigned_by")
    .references(() => user.id, { onDelete: "restrict" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projectBookmarks = pgTable(
  "project_bookmarks",
  {
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.projectId] })],
);

// INVENTORY
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  quantity: integer("quantity").default(0),
  reorderThreshold: integer("reorder_threshold").default(10),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inventoryRequests = pgTable("inventory_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "restrict" })
    .notNull(),
  itemId: uuid("item_id")
    .references(() => inventoryItems.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: inventoryRequestStatusEnum("status").default("pending"),
  reason: text("reason"),
  reviewedBy: text("reviewed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  reviewComment: text("review_comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

// NOTIFICATIONS
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("notifications_user_read_created_idx").on(
      t.userId,
      t.read,
      t.createdAt,
    ),
  ],
);

export const projectEditLog = pgTable(
  "project_edit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    editorId: text("editor_id")
      .references(() => user.id, { onDelete: "restrict" })
      .notNull(),
    changedFields: text("changed_fields").array().notNull(),
    oldValues: jsonb("old_values").notNull(),
    newValues: jsonb("new_values").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("project_edit_log_project_idx").on(t.projectId, t.createdAt)],
);
