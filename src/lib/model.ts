import type { z } from "zod";
import type {
  ContentSchema,
  ProjectSchema,
  ImageSchema,
  CropSchema,
} from "./schema";
export type ImageAsset = z.infer<typeof ImageSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Content = z.infer<typeof ContentSchema>;
export type CropArea = z.infer<typeof CropSchema>;
export function selectProjects(
  projects: Project[],
  query: string,
  category: string,
) {
  const text = query.trim().toLocaleLowerCase();
  return projects
    .filter((p) =>
      text
        ? [p.title, ...p.categories].some((v) =>
            v.toLocaleLowerCase().includes(text),
          )
        : category === "All" || p.categories.includes(category),
    )
    .sort(
      (a, b) =>
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
        a.id.localeCompare(b.id),
    );
}
export function usedCategories(content: Content) {
  return content.categories.filter((c) =>
    content.projects.some((p) => p.categories.includes(c)),
  );
}
export function imageUrl(image: ImageAsset) {
  return `${import.meta.env.BASE_URL}media/${image.file}`;
}
