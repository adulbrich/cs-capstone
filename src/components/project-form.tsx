import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { applyServerErrors } from "#/lib/apply-server-errors";

export const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).default(""),
  problemStatement: z.string().max(5000).default(""),
  objectives: z.string().max(5000).default(""),
  minQualifications: z.string().max(2000).default(""),
  prefQualifications: z.string().max(2000).default(""),
  url: z.string().max(500).default(""),
  contactEmail: z.string().max(200).default(""),
  contactName: z.string().max(200).default(""),
  imageUrl: z.string().max(500).default(""),
  licenseRestrictions: z.string().max(1000).default(""),
  programId: z.string().default(""),
  notes: z.string().max(5000).default(""),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

type Props = {
  initial?: Partial<ProjectFormValues>;
  showNotes: boolean;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<unknown>;
};

export function ProjectForm({
  initial,
  showNotes,
  submitLabel,
  onSubmit,
}: Props) {
  const form = useForm({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      problemStatement: initial?.problemStatement ?? "",
      objectives: initial?.objectives ?? "",
      minQualifications: initial?.minQualifications ?? "",
      prefQualifications: initial?.prefQualifications ?? "",
      url: initial?.url ?? "",
      contactEmail: initial?.contactEmail ?? "",
      contactName: initial?.contactName ?? "",
      imageUrl: initial?.imageUrl ?? "",
      licenseRestrictions: initial?.licenseRestrictions ?? "",
      programId: initial?.programId ?? "",
      notes: initial?.notes ?? "",
    } satisfies ProjectFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = projectFormSchema.safeParse(value);
        if (result.success) return undefined;
        const fields: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path.join(".");
          if (key && !fields[key]) fields[key] = issue.message;
        }
        return { fields };
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
      } catch (err) {
        const handled = applyServerErrors(
          form as unknown as Parameters<typeof applyServerErrors>[0],
          err,
        );
        if (!handled) throw err;
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <Field form={form} name="title" label="Title" />
      <Field
        form={form}
        name="description"
        label="Description"
        textarea
        rows={4}
      />
      <Field
        form={form}
        name="problemStatement"
        label="Problem statement"
        textarea
        rows={3}
      />
      <Field
        form={form}
        name="objectives"
        label="Objectives / deliverables"
        textarea
        rows={3}
      />
      <Field
        form={form}
        name="minQualifications"
        label="Minimum qualifications"
        textarea
        rows={2}
      />
      <Field
        form={form}
        name="prefQualifications"
        label="Preferred qualifications"
        textarea
        rows={2}
      />
      <Field form={form} name="url" label="URL" />
      <Field form={form} name="contactName" label="Contact name" />
      <Field form={form} name="contactEmail" label="Contact email" />
      <Field
        form={form}
        name="imageUrl"
        label="Image URL (upload coming in Spec 4)"
      />
      <Field
        form={form}
        name="licenseRestrictions"
        label="License / IP restrictions"
        textarea
        rows={2}
      />
      <Field
        form={form}
        name="programId"
        label="Program ID (UUID; admin UI coming in Spec 3)"
      />
      {showNotes && (
        <Field
          form={form}
          name="notes"
          label="Internal notes (staff only)"
          textarea
          rows={3}
        />
      )}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: TanStack Form generics are unstable; field name comes from schema
type AnyForm = any;

type FieldProps = {
  form: AnyForm;
  name: keyof ProjectFormValues;
  label: string;
  textarea?: boolean;
  rows?: number;
};

function Field({ form, name, label, textarea, rows }: FieldProps) {
  return (
    <form.Field name={name as never}>
      {(field: AnyForm) => (
        <div>
          <label htmlFor={field.name} className="block font-medium text-sm">
            {label}
          </label>
          {textarea ? (
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={rows}
              className="mt-1 w-full border p-2"
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="mt-1 w-full border p-2"
            />
          )}
          {field.state.meta.errors.length > 0 && (
            <p className="mt-1 text-red-600 text-sm">
              {field.state.meta.errors.join(", ")}
            </p>
          )}
        </div>
      )}
    </form.Field>
  );
}
