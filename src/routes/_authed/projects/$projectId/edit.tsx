import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ProjectForm } from "#/components/project-form";
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
    return data;
  },
  component: EditProject,
});

function EditProject() {
  const navigate = useNavigate();
  const { project, viewerIsStaff } = Route.useLoaderData();
  if (!project) return null;
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Edit project</h1>
      <div className="mt-6">
        <ProjectForm
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
          showNotes={viewerIsStaff}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateProject({
              data: {
                id: project.id as string,
                ...values,
                programId: values.programId || null,
                notes: viewerIsStaff ? values.notes || null : null,
              },
            });
            navigate({
              to: "/projects/$projectId",
              params: { projectId: project.id as string },
            });
          }}
        />
      </div>
    </div>
  );
}
