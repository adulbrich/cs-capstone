import { ImageUploader } from "./image-uploader";

type Props = {
  currentKey: string | null;
  onChange: (file: File | null) => void;
};

export function ProjectImageUploader({ currentKey, onChange }: Props) {
  return (
    <ImageUploader
      currentKey={currentKey}
      aspect={16 / 9}
      maxWidth={1600}
      maxHeight={900}
      onChange={onChange}
    />
  );
}
