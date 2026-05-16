import { beforeEach } from "vitest";
import { resetDatabase } from "./db-reset";

beforeEach(async () => {
  await resetDatabase();
});
