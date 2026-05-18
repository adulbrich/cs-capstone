// Run via `npm run storage:init` (uses tsx --env-file=.env.local).
// Idempotent: creates the bucket if absent, no-ops otherwise.
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET ?? "cs-capstone";

const client = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint,
  forcePathStyle: !!endpoint,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

async function main() {
  try {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log(`Created bucket ${bucket}`);
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "";
    if (name === "BucketAlreadyOwnedByYou" || name === "BucketAlreadyExists") {
      console.log(`Bucket ${bucket} already exists`);
      return;
    }
    throw err;
  }
}

main().then(() => process.exit(0));
