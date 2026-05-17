import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ProjectCard } from "#/components/project-card";
import { listPublishedProjects } from "#/server/projects-queries";

const searchSchema = z.object({ page: z.number().int().min(1).default(1) });

export const Route = createFileRoute("/projects/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    return await listPublishedProjects({
      data: { page: deps.page, pageSize: 20 },
    });
  },
  component: ProjectsList,
});

function ProjectsList() {
  const { rows, total, page, pageSize } = Route.useLoaderData();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500">No published projects yet.</p>
        ) : (
          rows.map((p) => <ProjectCard key={p.id} project={p} />)
        )}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          to="/projects"
          search={{ page: Math.max(1, page - 1) }}
          className={page <= 1 ? "text-neutral-300" : "hover:underline"}
        >
          Previous
        </Link>
        <span>
          Page {page} of {totalPages}
        </span>
        <Link
          to="/projects"
          search={{ page: Math.min(totalPages, page + 1) }}
          className={
            page >= totalPages ? "text-neutral-300" : "hover:underline"
          }
        >
          Next
        </Link>
      </div>
    </div>
  );
}
