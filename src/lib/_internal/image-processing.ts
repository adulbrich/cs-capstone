import sharp from "sharp";

export type ProcessImageOptions = {
  maxWidth: number;
  maxHeight: number;
};

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
};

export async function processImage(
  input: Buffer,
  opts: ProcessImageOptions,
): Promise<ProcessedImage> {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({
      width: opts.maxWidth,
      height: opts.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp",
    width: info.width,
    height: info.height,
  };
}
