import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { beforeEach } from "vitest";
import { resetDatabase } from "./db-reset";

beforeEach(async () => {
  await resetDatabase();
});
