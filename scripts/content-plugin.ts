import type { Plugin } from "vite";
import fs from "node:fs/promises";
import path from "node:path";
import { ContentSchema, type Content } from "../src/lib/schema.ts";
import { published, assets } from "./paths.ts";
export function contentPlugin(
  snapshot?: Content,
  sourceAssets = assets,
): Plugin {
  let data: Content;
  return {
    name: "gallery-content",
    async buildStart() {
      data =
        snapshot ??
        ContentSchema.parse(JSON.parse(await fs.readFile(published, "utf8")));
    },
    resolveId(id) {
      if (id === "virtual:content") return "\0virtual:content";
    },
    load(id) {
      if (id === "\0virtual:content")
        return `export default ${JSON.stringify(data)}`;
    },
    async generateBundle() {
      const files = new Set(
        data.projects.flatMap((p) => [
          p.desktop.file,
          p.mobile.file,
          ...p.gallery.map((i) => i.file),
        ]),
      );
      for (const file of files)
        this.emitFile({
          type: "asset",
          fileName: `media/${file}`,
          source: await fs.readFile(path.join(sourceAssets, file)),
        });
    },
    configureServer(server) {
      server.middlewares.use("/media", async (req, res, next) => {
        const file = decodeURIComponent((req.url ?? "").split("?")[0].slice(1));
        if (!/^[a-zA-Z0-9_-]+\.(webp|jpg|png)$/.test(file)) return next();
        try {
          const bytes = await fs.readFile(path.join(sourceAssets, file));
          res.setHeader(
            "Content-Type",
            file.endsWith(".webp")
              ? "image/webp"
              : file.endsWith(".png")
                ? "image/png"
                : "image/jpeg",
          );
          res.end(bytes);
        } catch {
          next();
        }
      });
    },
  };
}
