import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build, loadEnv } from "vite";
import { analyticsConfig } from "../src/lib/analytics-config.ts";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { contentPlugin } from "./content-plugin.ts";
import { root, local, published } from "./paths.ts";
import { ContentSchema, type Content } from "../src/lib/schema.ts";
export async function prepareSiteBuild(
  content?: Content,
  sourceAssets?: string,
) {
  analyticsConfig({ ...loadEnv("production", root, "VITE_"), ...process.env });
  const snapshot = ContentSchema.parse(
    content ?? JSON.parse(await fs.readFile(published, "utf8")),
  );
  const next = path.join(local, "build-next");
  await fs.mkdir(local, { recursive: true });
  await build({
    configFile: false,
    root,
    base: "./",
    mode: "production",
    plugins: [react(), tailwind(), contentPlugin(snapshot, sourceAssets)],
    build: { outDir: next, emptyOutDir: true },
  });
  return { directory: next, snapshot };
}
export async function buildSite(content?: Content) {
  const { directory: next, snapshot } = await prepareSiteBuild(content);
  const destination = path.join(root, "dist");
  const backup = path.join(local, "build-previous");
  await fs.rm(backup, { recursive: true, force: true });
  let hadPrevious = false;
  try {
    await fs.rename(destination, backup);
    hadPrevious = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  try {
    await fs.rename(next, destination);
  } catch (error) {
    if (hadPrevious) await fs.rename(backup, destination);
    throw error;
  }
  return { directory: destination, snapshot };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await buildSite();
