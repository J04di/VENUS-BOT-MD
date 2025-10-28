import path from "node:path";
import os from "node:os";

export const paths = {
  sessions: path.resolve(".sessions"),
  tmp: path.resolve(os.tmpdir()),
  plugins: path.resolve(import.meta.dirname, "..", "bot", "plugins"),
  database: path.resolve("venus.enc"),
};
