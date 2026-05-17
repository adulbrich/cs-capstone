import { useEffect, useState } from "react";
import { canTransition, type Status } from "#/lib/project-workflow";
import {
  approveProject,
  archiveProject,
  hardDeleteProject,
  publishProject,
  requestChanges,
  restoreArchived,
  restoreProject,
  returnToDraft,
  softDeleteProject,
  submitProject,
} from "#/server/projects";
import { listProjectEditLog } from "#/server/projects-queries";

type Project = {
  id: string;
  status: string;
  deletedAt: Date | string | null;
  notes: string | null;
};

type EditLogRow = {
  id: string;
  editorId: string;
  changedFields: string[];
  oldValues: unknown;
  newValues: unknown;
  createdAt: Date | string;
};

type ActionId =
  | "submit"
  | "draft"
  | "approve"
  | "request_changes"
  | "publish"
  | "archive"
  | "restoreArchived"
  | "softDelete"
  | "restore"
  | "hardDelete";

const ACTION_TO_STATUS: Record<ActionId, Status | null> = {
  submit: "submitted",
  draft: "draft",
  approve: "approved",
  request_changes: "changes_requested",
  publish: "published",
  archive: "archived",
  restoreArchived: "published",
  softDelete: null,
  restore: null,
  hardDelete: null,
};

function actionAllowed(action: ActionId, currentStatus: Status): boolean {
  const target = ACTION_TO_STATUS[action];
  if (!target) return false;
  return canTransition(currentStatus, target, "staff");
}

export function StaffProjectPanel({
  project,
  onChanged,
}: {
  project: Project;
  onChanged: () => void;
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editLog, setEditLog] = useState<EditLogRow[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const { rows } = await listProjectEditLog({
          data: { id: project.id },
        });
        setEditLog(rows as EditLogRow[]);
      } catch {
        // ignored
      }
    })();
  }, [project.id]);

  async function run(action: ActionId) {
    setError(null);
    try {
      switch (action) {
        case "submit":
          await submitProject({ data: { id: project.id, comment } });
          break;
        case "draft":
          await returnToDraft({ data: { id: project.id, comment } });
          break;
        case "approve":
          await approveProject({ data: { id: project.id, comment } });
          break;
        case "request_changes":
          await requestChanges({ data: { id: project.id, comment } });
          break;
        case "publish":
          await publishProject({ data: { id: project.id, comment } });
          break;
        case "archive":
          await archiveProject({ data: { id: project.id, comment } });
          break;
        case "restoreArchived":
          await restoreArchived({ data: { id: project.id, comment } });
          break;
        case "softDelete":
          await softDeleteProject({ data: { id: project.id } });
          break;
        case "restore":
          await restoreProject({ data: { id: project.id } });
          break;
        case "hardDelete":
          if (!confirm("Permanently delete this draft?")) return;
          await hardDeleteProject({ data: { id: project.id } });
          window.location.href = "/admin/projects";
          return;
      }
      setComment("");
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const buttons: Array<{ id: ActionId; label: string; show: boolean }> = [
    {
      id: "submit",
      label: "Submit",
      show: actionAllowed("submit", project.status as Status),
    },
    {
      id: "draft",
      label: "Return to draft",
      show: actionAllowed("draft", project.status as Status),
    },
    {
      id: "request_changes",
      label: "Request changes",
      show: actionAllowed("request_changes", project.status as Status),
    },
    {
      id: "approve",
      label: "Approve",
      show: actionAllowed("approve", project.status as Status),
    },
    {
      id: "publish",
      label: "Publish",
      show: actionAllowed("publish", project.status as Status),
    },
    {
      id: "archive",
      label: "Archive",
      show: actionAllowed("archive", project.status as Status),
    },
    {
      id: "restoreArchived",
      label: "Restore from archive",
      show: actionAllowed("restoreArchived", project.status as Status),
    },
    {
      id: "softDelete",
      label: "Soft delete",
      show: !project.deletedAt && project.status !== "draft",
    },
    { id: "restore", label: "Restore", show: !!project.deletedAt },
    {
      id: "hardDelete",
      label: "Hard delete",
      show: project.status === "draft" && !project.deletedAt,
    },
  ];

  return (
    <div className="mt-8 border-2 border-purple-300 bg-purple-50 p-4">
      <h2 className="font-semibold text-lg">Staff panel</h2>

      {project.notes && (
        <section className="mt-3">
          <h3 className="font-medium text-sm">Internal notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm">{project.notes}</p>
        </section>
      )}

      <section className="mt-4 space-y-2">
        <label
          htmlFor="staff-action-comment"
          className="block font-medium text-sm"
        >
          Optional comment (added to status history)
        </label>
        <textarea
          id="staff-action-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full border p-2"
        />
        <div className="flex flex-wrap gap-2">
          {buttons
            .filter((b) => b.show)
            .map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => void run(b.id)}
                className="border px-3 py-1.5 text-sm hover:bg-neutral-100"
              >
                {b.label}
              </button>
            ))}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </section>

      <section className="mt-6">
        <h3 className="font-medium text-sm">Edit log</h3>
        {editLog.length === 0 ? (
          <p className="text-neutral-500 text-sm">No edits yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {editLog.map((row) => (
              <li key={row.id} className="border-l-2 border-neutral-300 pl-2">
                <div className="text-neutral-500 text-xs">
                  {row.editorId.slice(0, 8)} at{" "}
                  {new Date(row.createdAt).toLocaleString()}
                </div>
                <div className="text-xs">
                  Changed: {row.changedFields.join(", ")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
