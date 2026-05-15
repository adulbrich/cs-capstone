import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "instructor",
  "admin",
]);
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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user"),
  affiliation: text("affiliation"),
  linkedin: text("linkedin"),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: text("course_id").notNull(),
  courseName: text("course_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programInstructors = pgTable("program_instructors", {
  id: uuid("id").defaultRandom().primaryKey(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'project_type', 'technology', 'industry', 'field'
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
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
  notes: text("notes"), // internal only

  proposerId: uuid("proposer_id")
    .references(() => users.id)
    .notNull(),
  programId: uuid("program_id").references(() => programs.id),

  status: projectStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at"),
  archivedAt: timestamp("archived_at"),
  deletedAt: timestamp("deleted_at"), // soft delete

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectCategories = pgTable("project_categories", {
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
});

export const projectCollaborators = pgTable("project_collaborators", {
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  role: text("role").default("collaborator"),
});

export const projectComments = pgTable("project_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  parentId: uuid("parent_id"), // for replies
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // admin-only
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectStatusHistory = pgTable("project_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  oldStatus: projectStatusEnum("old_status"),
  newStatus: projectStatusEnum("new_status").notNull(),
  changedBy: uuid("changed_by")
    .references(() => users.id)
    .notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectBids = pgTable("project_bids", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  studentId: uuid("student_id")
    .references(() => users.id)
    .notNull(),
  programId: uuid("program_id")
    .references(() => programs.id)
    .notNull(),
  motivation: text("motivation").notNull(),
  qualifications: text("qualifications"),
  rank: integer("rank").notNull(), // 1-5 preference
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectAssignments = pgTable("project_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  studentId: uuid("student_id")
    .references(() => users.id)
    .notNull(),
  assignedBy: uuid("assigned_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectBookmarks = pgTable("project_bookmarks", {
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// INVENTORY
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  quantity: integer("quantity").default(0),
  reorderThreshold: integer("reorder_threshold").default(10),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventoryRequests = pgTable("inventory_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  itemId: uuid("item_id")
    .references(() => inventoryItems.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: inventoryRequestStatusEnum("status").default("pending"),
  reason: text("reason"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewComment: text("review_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// NOTIFICATIONS
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  type: text("type").notNull(), // 'status_change', 'comment', 'request_approved', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
