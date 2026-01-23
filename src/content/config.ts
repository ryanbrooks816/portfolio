// Import the glob loader
import { glob } from "astro/loaders";
// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
// Define a `loader` and `schema` for each collection
const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()),
    type: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    thumbnail: z.string().optional(),
    featured: z.boolean().optional(),
    private: z.boolean().optional(),
    teamSize: z.number().optional(),
    role: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    challenges: z.array(z.string()).optional(),
    learnings: z.array(z.string()).optional(),
    techDetails: z
      .object({
        architecture: z.string().optional(),
        database: z.string().optional(),
        deployment: z.string().optional(),
        testing: z.string().optional(),
        performance: z.string().optional(),
      })
      .optional(),
    gallery: z
      .object({
        images: z.array(z.string()),
        captions: z.array(z.string()),
      })
      .optional(),
    timeline: z
      .array(
        z.object({
          phase: z.string(),
          duration: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    responsibilities: z.array(z.string()).optional(),
    links: z
      .object({
        github: z.string().url().optional(),
      })
      .optional(),
  }),
});
// Export a single `collections` object to register your collection(s)
export const collections = { projects: projectsCollection };
