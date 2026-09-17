import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const projectsCollection = defineCollection({
  loader: glob({ pattern: ["**/[^_]*.md", "**/[^_]*.mdx"], base: "./src/content/projects" }),
  schema: z.object({
    // Main Details
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    type: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(), // Can be left out when it's not needed or treated as "Present"
    thumbnail: z.string().optional(), // Links should be relative to the project's subfolder
    featured: z.boolean().optional(),
    private: z.boolean().optional(),
    // Optional Details
    teamSize: z.number().optional(),
    role: z.string().optional(),
    // Outcomes Section above Project Summary (only when important)
    outcomes: z.array(z.string()).optional(),
    // Project Summary Sections
    achievements: z.array(z.string()).optional(),
    challenges: z.array(z.string()).optional(),
    learnings: z.array(z.string()).optional(),
    // Gallery Section
    gallery: z
      .object({
        images: z.array(z.string()),
        captions: z.array(z.string()),
      })
      .optional(),
    // Sidebar Sections
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
    // Action Links Section
    links: z.record(z.string()).optional(), // Accept any key with a string value
  }),
});

// Export a collections object to register the collections
export const collections = { projects: projectsCollection };
