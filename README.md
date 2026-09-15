# Ryan Brooks Portfolio

This is the public source for my portfolio website. It is built with Astro, styled with Tailwind, and deployed as a Cloudflare Worker.

## Repository layout

The public `portfolio` repository contains the site code, configuration, and deployment scripts. Private portfolio data lives in a separate repository named `portfolio-data` and is never committed here.

The local layout should be:

```text
parent/
├── portfolio/
└── portfolio-data/
    ├── projects/
    │   ├── project-name/
    │   │   ├── project.md
    │   │   └── assets...
    │   └── optional-flat-project.md
    ├── photos/
    ├── resume.pdf
    └── text.ts
```

The private data repository supplies project Markdown and materials, photos, the resume, and the site copy in `text.ts`. The generated copies in `src/content/projects/`, `public/projects/`, `public/resume.pdf`, `public/photo.*`, and `src/data/text.ts` are all ignored by Git.

## Local development

Clone both repositories side by side, install dependencies, and sync the private data before starting Astro:

```sh
npm install
npm run sync-data
npm run dev
```

Run `npm run sync-data` whenever the private data changes. It removes and recreates the generated project content, then copies the resume, photos, and text data into the locations expected by the site.

## Deployment

The Cloudflare configuration is in `wrangler.jsonc`. A deployment environment must be authorized to access the private `portfolio-data` repository and run the sync step before building:

```sh
npm run sync-data
npm run build
npm run deploy
```

The live site is currently available at <https://portfolio.sotcompass.workers.dev/>.

Keeping source files in a private repository does not by itself make generated pages or assets private. Any data included in a public static build must also be protected by the application or deployed separately.
