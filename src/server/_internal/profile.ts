import { eq } from "drizzle-orm";
import { db } from "#/db";
import { user } from "#/db/schema";
import { requireUser } from "#/lib/_internal/auth-guards";
import type { ProfileInput } from "../profile";

export async function updateProfileForCurrentUser(data: ProfileInput) {
  const current = await requireUser();
  await db
    .update(user)
    .set({
      name: data.name,
      affiliation: data.affiliation ?? null,
      linkedin: data.linkedin ?? null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, current.id));
  return { ok: true };
}
