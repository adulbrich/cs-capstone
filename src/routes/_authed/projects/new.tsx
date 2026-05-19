import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectForm } from "#/components/project-form";
import { setProjectCategories } from "#/server/categories";
import { createProject } from "#/server/projects";

export const Route = createFileRoute("/_authed/projects/new")({
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const ctx = Route.useRouteContext() as {
    user: { role?: string | null };
  };
  const isStaff = ctx.user.role === "admin" || ctx.user.role === "instructor";
  // One stable UUID per mount, reused for the storage key AND createProject's id.
  const [projectId] = useState<string>(() => crypto.randomUUID());

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">New project</h1>
      <div className="mt-6">
        <ProjectForm
          projectId={projectId}
          showNotes={isStaff}
          showCategories={isStaff}
          submitLabel="Create draft"
          onSubmit={async (values, categoryIds) => {
            const { id } = await createProject({
              data: {
                id: projectId,
                ...values,
                programId: values.programId || null,
                notes: isStaff ? values.notes || null : null,
              },
            });
            if (isStaff && categoryIds.length > 0) {
              await setProjectCategories({
                data: { projectId: id, categoryIds },
              });
            }
            navigate({
              to: "/projects/$projectId",
              params: { projectId: id },
            });
          }}
        />
      </div>
    </div>
  );
}
