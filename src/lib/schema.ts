import { z } from "zod";
const safeFile = z.string().regex(/^[a-zA-Z0-9_-]+\.(webp|jpg|png)$/);
export const CropSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
});
export const ImageSchema = z.object({
  file: safeFile,
  original: safeFile.optional(),
  alt: z
    .string()
    .trim()
    .min(1, "Describe the image for screen readers.")
    .max(500),
  crop: CropSchema.optional(),
});
const httpUrl = z
  .url()
  .refine(
    (v) => ["http:", "https:"].includes(new URL(v).protocol),
    "Use an http:// or https:// URL.",
  );
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  url: httpUrl,
  developer: z.string().trim().min(1).max(160),
  developerUrl: httpUrl,
  publishedAt: z.string().datetime({ offset: true }),
  categories: z.array(z.string().trim().min(1).max(60)).min(1),
  desktop: ImageSchema,
  mobile: ImageSchema,
  gallery: z.array(ImageSchema).max(2),
  review: z
    .string()
    .max(30000)
    .refine(
      (v) =>
        v
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim().length > 0,
      "Write a review.",
    ),
});
export const ContentSchema = z
  .object({
    version: z.literal(1),
    categories: z.array(z.string().trim().min(1).max(60)).max(200),
    projects: z.array(ProjectSchema),
  })
  .superRefine((value, ctx) => {
    const names = value.categories.map((v) => v.toLowerCase());
    if (new Set(names).size !== names.length || !names.includes("other"))
      ctx.addIssue({
        code: "custom",
        message: "Categories must be unique and include Other.",
      });
    if (new Set(value.projects.map((p) => p.id)).size !== value.projects.length)
      ctx.addIssue({ code: "custom", message: "Project IDs must be unique." });
    for (const p of value.projects)
      if (p.categories.some((c) => !value.categories.includes(c)))
        ctx.addIssue({
          code: "custom",
          message: "Project has an unknown category.",
        });
  });

export type { Content, Project, ImageAsset, CropArea } from "./model";
