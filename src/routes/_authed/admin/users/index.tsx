import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AdminTable } from "#/components/admin-table";
import { getSession } from "#/lib/auth-guards";
import { listUsers } from "#/server/users";

const ROLES = ["user", "instructor", "admin"] as const;

const searchSchema = z.object({
  q: z.string().default(""),
  role: z.enum(ROLES).nullable().default(null),
  includeBanned: z.boolean().default(true),
  page: z.number().int().min(1).default(1),
});

export const Route = createFileRoute("/_authed/admin/users/")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user) throw redirect({ to: "/sign-in" });
    if (session.user.role !== "admin") throw redirect({ to: "/admin" });
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    return await listUsers({
      data: {
        q: deps.q,
        role: deps.role,
        includeBanned: deps.includeBanned,
        page: deps.page,
        pageSize: 20,
      },
    });
  },
  component: UsersAdmin,
});

function UsersAdmin() {
  const navigate = useNavigate({ from: "/admin/users/" });
  const { rows, total, page, pageSize } = Route.useLoaderData();
  const { q, role, includeBanned } = Route.useSearch();
  const [qDraft, setQDraft] = useState(q);

  useEffect(() => setQDraft(q), [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (qDraft !== q) {
        void navigate({
          search: (prev) => ({ ...prev, q: qDraft, page: 1 }),
        });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [qDraft, q, navigate]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Admin: users</h1>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="user-search"
            className="block text-xs font-medium text-neutral-500"
          >
            Search
          </label>
          <input
            id="user-search"
            type="search"
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            placeholder="Email or name"
            className="mt-1 border p-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="user-role"
            className="block text-xs font-medium text-neutral-500"
          >
            Role
          </label>
          <select
            id="user-role"
            value={role ?? ""}
            onChange={(e) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  role: (e.target.value || null) as
                    | (typeof ROLES)[number]
                    | null,
                  page: 1,
                }),
              })
            }
            className="mt-1 border bg-white p-2 text-sm dark:bg-neutral-900"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={includeBanned}
            onChange={(e) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  includeBanned: e.target.checked,
                  page: 1,
                }),
              })
            }
          />
          Include banned
        </label>
      </div>

      <AdminTable columns={["Email", "Name", "Role", "Banned", ""]}>
        {rows.map((u) => (
          <tr key={u.id}>
            <td className="border border-neutral-200 p-2 dark:border-neutral-800">
              {u.email}
            </td>
            <td className="border border-neutral-200 p-2 dark:border-neutral-800">
              {u.name ?? "(none)"}
            </td>
            <td className="border border-neutral-200 p-2 dark:border-neutral-800">
              {u.role}
            </td>
            <td className="border border-neutral-200 p-2 dark:border-neutral-800">
              {u.banned ? "yes" : ""}
            </td>
            <td className="border border-neutral-200 p-2 dark:border-neutral-800">
              <Link
                to="/admin/users/$userId"
                params={{ userId: u.id }}
                className="text-blue-700 hover:underline"
              >
                Manage
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          to="/admin/users"
          search={(prev) => ({ ...prev, page: Math.max(1, page - 1) })}
          className={page <= 1 ? "text-neutral-300" : "hover:underline"}
        >
          Previous
        </Link>
        <span>
          Page {page} of {totalPages}
        </span>
        <Link
          to="/admin/users"
          search={(prev) => ({
            ...prev,
            page: Math.min(totalPages, page + 1),
          })}
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
