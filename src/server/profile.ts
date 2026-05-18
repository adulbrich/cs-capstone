import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(120),
  affiliation: z.string().max(200).nullable().optional(),
  linkedin: z.string().url().max(300).nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data }) => {
    const { updateProfileForCurrentUser } = await import("./_internal/profile");
    return updateProfileForCurrentUser(data);
  });
