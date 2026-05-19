import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ProjectForm } from "#/components/project-form";
import {
  listProjectCategories,
  setProjectCategories,
} from "#/server/categories";
import { updateProject } from "#/server/projects";
import { getProject } from "#/server/projects-queries";

export const Route = createFileRoute("/_authed/projects/$projectId/edit")({
  loader: async ({ params }) => {
    const data = await getProject({ data: { id: params.projectId } });
    if (!data.project || !data.canEdit) {
      throw redirect({
        to: "/projects/$projectId",
        params: { projectId: params.projectId },
      });
    }
    const { rows: categoryRows } = await listProjectCategories({
      data: { projectId: params.projectId },
    });
    return { ...data, categoryIds: categoryRows.map((c) => c.id) };
  },
  component: EditProject,
});

function EditProject() {
  const navigate = useNavigate();
  const { project, viewerIsStaff, categoryIds } = Route.useLoaderData();
  if (!project) return null;
  const projectId = project.id as string;
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Edit project</h1>
      <div className="mt-6">
        <ProjectForm
          projectId={projectId}
          initial={{
            title: project.title as string,
            description: (project.description as string) ?? "",
            problemStatement: (project.problemStatement as string) ?? "",
            objectives: (project.objectives as string) ?? "",
            minQualifications: (project.minQualifications as string) ?? "",
            prefQualifications: (project.prefQualifications as string) ?? "",
            url: (project.url as string) ?? "",
            contactEmail: (project.contactEmail as string) ?? "",
            contactName: (project.contactName as string) ?? "",
            imageUrl: (project.imageUrl as string) ?? "",
            licenseRestrictions: (project.licenseRestrictions as string) ?? "",
            programId: (project.programId as string) ?? "",
            notes: (project.notes as string) ?? "",
          }}
          initialCategoryIds={categoryIds}
          showNotes={viewerIsStaff}
          showCategories={viewerIsStaff}
          submitLabel="Save"
          onSubmit={async (values, nextCategoryIds) => {
            await updateProject({
              data: {
                id: projectId,
                ...values,
                programId: values.programId || null,
                notes: viewerIsStaff ? values.notes || null : null,
              },
            });
            if (viewerIsStaff) {
              await setProjectCategories({
                data: { projectId, categoryIds: nextCategoryIds },
              });
            }
            navigate({
              to: "/projects/$projectId",
              params: { projectId },
            });
          }}
        />
      </div>
    </div>
  );
}
