import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { authorSchema, insightSchema } from "./content-schemas";

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights" }),
  schema: insightSchema,
});

const authors = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/authors" }),
  schema: authorSchema,
});

export const collections = { insights, authors };
