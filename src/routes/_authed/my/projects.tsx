import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ProjectCard } from "#/components/project-card";
import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { pageTitle } from "#/lib/page-title";
import { listMyProjects } from "#/server/projects-queries";

const STATUSES = [
  "all",
  "draft",
  "submitted",
  "approved",
  "changes_requested",
  "published",
  "archived",
] as const;

const searchSchema = z.object({
  status: z.enum(STATUSES).default("all"),
});

export const Route = createFileRoute("/_authed/my/projects")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: pageTitle("My Projects") }] }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: async ({ deps }) => {
    return await listMyProjects({ data: { status: deps.status } });
  },
  component: MyProjects,
});

function MyProjects() {
  const { rows } = Route.useLoaderData();
  const { status } = Route.useSearch();
  const navigate = useNavigate();

  const label = (s: string) => s.replace(/_/g, " ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Projects</h1>
        <Button asChild size="sm">
          <Link to="/projects/new">New project</Link>
        </Button>
      </div>

      {/* Mobile: Select */}
      <div className="mt-4 md:hidden">
        <Select
          value={status}
          onValueChange={(s) =>
            void navigate({
              to: "/my/projects",
              search: { status: s as (typeof STATUSES)[number] },
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {label(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: tab strip */}
      <div className="mt-4 hidden border-b border-border text-sm md:flex">
        {STATUSES.map((s) => (
          <Link
            key={s}
            to="/my/projects"
            search={{ status: s }}
            className={
              s === status
                ? "-mb-px border-b-2 px-3 py-1.5 font-medium"
                : "px-3 py-1.5 text-muted-foreground hover:text-foreground"
            }
            style={
              s === status
                ? { borderBottomColor: "var(--brand-primary)" }
                : undefined
            }
          >
            {label(s)}
          </Link>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects in this view.
          </p>
        ) : (
          rows.map((p) => <ProjectCard key={p.id} project={p} />)
        )}
      </div>
    </div>
  );
}
