import { useState } from "react";
import { clearAvatar, uploadAvatar } from "#/server/uploads";
import { ImageUploader } from "./image-uploader";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Save failed. Please try again.";
}

type Props = {
  currentKey: string | null;
  onChanged: () => void;
};

export function AvatarUploader({ currentKey, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(file: File | null) {
    setBusy(true);
    setError(null);
    try {
      if (file) {
        const form = new FormData();
        form.append("file", file);
        await uploadAvatar({ data: form });
      } else {
        await clearAvatar();
      }
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <ImageUploader
        currentKey={currentKey}
        aspect={1}
        maxWidth={512}
        maxHeight={512}
        onChange={(f) => void handleChange(f)}
      />
      {busy && <p className="text-sm text-neutral-500">Saving avatar...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
