import path from "node:path";
import { fileURLToPath } from "node:url";
export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const assets = path.join(root, "content/assets");
export const published = path.join(root, "content/published.json");
export const local = path.join(root, ".local");
