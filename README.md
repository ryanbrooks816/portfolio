# Ryan Brooks Portfolio

Public source for my portfolio site, built with Astro and deployed to Cloudflare Workers.

## Quick start

```sh
npm install
npm run dev
```

Then create the local content files described below. The repository includes the types and examples so the site can be adapted for your own portfolio.

## Repository layout

```text
src/
├── content/projects/       # One .md or .mdx file per project
├── data/
│   ├── text.ts             # Profile, experience, interests, and skills
│   └── types.ts            # Types used by text.ts
├── components/             # Reusable Astro components
└── pages/                  # Site routes
public/
├── projects/               # Project images and downloadable assets
├── photo.webp              # Navigation/profile photo
└── resume.pdf              # Optional résumé
```

## Profile content

Create `src/data/text.ts`. The values are checked against the types in `src/data/types.ts`, so missing fields and invalid experience layouts are caught by TypeScript.

```ts
import type { PortfolioText, SkillGroup } from "./types";

export const text = {
  name: "Your Name",
  title: ["Your role", "Your focus"],
  tagline: "A short sentence describing the work you do.",
  contact: {
    email: "you@example.com",
    github: "https://github.com/your-user",
    linkedin: "https://www.linkedin.com/in/your-user",
    resume: "/resume.pdf",
  },
  about: {
    intro: "The first paragraph of your introduction.",
    focus: "The kinds of systems, problems, or technologies you work on.",
    personal: "A short personal detail or closing thought.",
  },
  experience: [
    {
      title: "Organization or school",
      description: "Role, degree, or area of study",
      date: "2024-01",
      endDate: "Present",
      content: {
        layout: "bullets",
        items: ["A concise accomplishment or responsibility."],
      },
    },
  ],
  skillsIntro: "A short introduction to your technical skills.",
  researchIntro: "A short description of your research interests.",
  contactSection: {
    heading: "Let's Connect",
    description: "A short invitation to get in touch.",
    buttonText: "Get In Touch",
  },
} satisfies PortfolioText;

export const interests = ["Systems", "Machine Learning", "Developer Tooling"] satisfies string[];

export const skills = [
  { name: "Languages", items: ["TypeScript", "Python"] },
  { name: "Frontend", items: ["Astro", "React", "Tailwind"] },
  { name: "Backend", items: ["Node.js", "SQL"] },
] satisfies SkillGroup[];
```

Experience entries support two layouts:

```ts
{ layout: "bullets", items: ["A longer accomplishment."] }
{ layout: "tags", items: ["Operating Systems", "Databases"] }
```

## Projects

Add a Markdown or MDX file to `src/content/projects/`. The required frontmatter is:

```md
---
title: "Example Project"
description: "A one- or two-sentence summary of the project."
tags: ["TypeScript", "Research Software"]
type: "personal"
date: "2026-01"
featured: false
private: false
---

## Project Overview

Explain the problem, your contribution, and the result.
```

Optional frontmatter includes `endDate`, `thumbnail`, `role`, `teamSize`, `achievements`, `challenges`, `learnings`, `responsibilities`, `timeline`, `gallery`, and `links`. Projects with a tag containing `Research` automatically appear in the Research section on the home page.

Use `.mdx` when a project needs an interactive component such as a gallery:

```mdx
import Gallery from "../../components/Gallery.astro";

<Gallery
  label="Project screenshots"
  images={[
    { src: "/projects/example/dashboard.png", alt: "Dashboard overview", caption: "The dashboard overview" },
    { src: "/projects/example/settings.png", alt: "Settings screen", caption: "Configurable project settings" },
  ]}
/>
```

Project assets belong in `public/projects/<project-slug>/`, and can be referenced with `/projects/<project-slug>/<file-name>`.

## Static assets

Add files directly to `public/` when the site references them from the root, for example:

```text
public/
├── photo.webp
├── resume.pdf
├── favicon.ico
└── site.webmanifest
```

The resume path in `text.contact.resume` should match the file in `public/`.

## Local and Cloudflare configuration

Copy the example Worker configuration before deploying:

```sh
cp wrangler.example.jsonc wrangler.jsonc
```

For local development and access-code verification, create a `.env` file with values that are not committed:

```dotenv
SESSION_SECRET=replace-with-a-long-random-value
CODE_SECRET=replace-with-a-different-long-random-value
```

If private projects are enabled, create a Cloudflare KV namespace and replace the placeholder `id` in `wrangler.jsonc` with its namespace ID. The `ACCESS_CODES` binding is used by the access API; no access codes belong in source files.

## Commands

```sh
npm run dev       # Start the local Astro server
npm run build     # Build the Cloudflare Worker
npm run deploy    # Build and deploy with Wrangler
```

The site uses Astro content collections to validate project frontmatter and the types in `src/data/types.ts` to validate profile content. Run `npm run build` after changing either content shape to catch configuration errors before deployment.
