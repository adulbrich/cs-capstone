import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reviewInputSchema = z.object({
  projectId: z.string().uuid(),
  fields: z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(5000).optional(),
    problemStatement: z.string().max(5000).optional(),
    objectives: z.string().max(5000).optional(),
    minQualifications: z.string().max(2000).optional(),
    prefQualifications: z.string().max(2000).optional(),
    licenseRestrictions: z.string().max(1000).optional(),
  }),
});

export const reviewProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reviewInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { reviewProjectForCurrentUser } = await import(
      "./_internal/project-review"
    );
    return reviewProjectForCurrentUser(data);
  });
