import { test } from "node:test";
import assert from "node:assert/strict";
import { ContentSchema, ProjectSchema } from "../src/lib/schema.ts";
import {
  selectProjects,
  usedCategories,
  type Project,
} from "../src/lib/model.ts";
const image = { file: "test.webp", alt: "A test landscape" };
export const fixture = (
  title: string,
  categories: string[],
  publishedAt: string,
  id: string,
): Project => ({
  id,
  title,
  categories,
  publishedAt,
  url: "https://example.com",
  developer: "Developer",
  developerUrl: "https://example.com",
  desktop: image,
  mobile: image,
  gallery: [],
  review: "<p>Review text</p>",
});
const a = fixture(
  "Orbit",
  ["Adventure"],
  "2026-01-01T10:00:00Z",
  "00000000-0000-4000-8000-000000000001",
);
const b = fixture(
  "Action painter",
  ["Puzzle"],
  "2026-02-01T10:00:00Z",
  "00000000-0000-4000-8000-000000000002",
);
const c = fixture(
  "Jump",
  ["Action"],
  "2026-03-01T10:00:00Z",
  "00000000-0000-4000-8000-000000000003",
);
test("partial, case-insensitive search matches title OR category, across all categories", () =>
  assert.deepEqual(
    selectProjects([a, b, c], "ACTI", "Adventure").map((p) => p.title),
    ["Jump", "Action painter"],
  ));
test("category selection and descending publication order", () => {
  assert.deepEqual(
    selectProjects([a, b, c], "", "All").map((p) => p.title),
    ["Jump", "Action painter", "Orbit"],
  );
  assert.deepEqual(selectProjects([a, b, c], "", "Puzzle"), [b]);
});
test("only categories with projects are offered; Other is explicit", () =>
  assert.deepEqual(
    usedCategories({
      version: 1,
      categories: ["Adventure", "Other", "Empty"],
      projects: [a],
    }),
    ["Adventure"],
  ));
test("reject unsafe URLs, missing descriptions, too many extra images and empty reviews", () => {
  for (const change of [
    { url: "javascript:alert(1)" },
    { desktop: { ...image, alt: "" } },
    { gallery: [image, image, image] },
    { review: "<p> </p>" },
  ])
    assert.equal(ProjectSchema.safeParse({ ...a, ...change }).success, false);
});
test("reject duplicate categories and unknown project category", () => {
  assert.equal(
    ContentSchema.safeParse({
      version: 1,
      categories: ["Other", "other"],
      projects: [],
    }).success,
    false,
  );
  assert.equal(
    ContentSchema.safeParse({
      version: 1,
      categories: ["Other"],
      projects: [a],
    }).success,
    false,
  );
});
