# Ryan Brooks Portfolio

Public source for my portfolio site, built with Astro and deployed to Cloudflare Workers.

## Repository layout

The public `portfolio` repository contains the site code, access control, configuration, and deployment scripts. The portfolio data is supplied in a sibling private repository, `portfolio-data` and contains project Markdown and materials, photos, and the site copy in `text.ts`.

```text
parent/
├── portfolio/
└── portfolio-data/
    ├── projects/
    │   ├── project-name/
    │   │   ├── project.md (or project.mdx)
    │   │   └── assets...
    │   └── optional-flat-project.md(x)
    ├── photos/
    ├── resume.pdf
    └── text.ts
```

This is how I manage the content, it is not necessary to sync a separate repository to run the site. Add any projects in `src/content/projects` (handled by Astro content collections) and any photos in `publuc`. The `text.ts` file goes in `src/data` and can be configured as you wish.

## Inline project galleries

Project content can use Astro components inline by using an `.mdx` file. Import the gallery from the content file and place it anywhere between paragraphs:

```mdx
import Gallery from "../../components/Gallery.astro";

Here is some context before the screenshots.

<Gallery
  label="Project screenshots"
  images={[
    { src: "/projects/example/dashboard.png", alt: "Dashboard overview", caption: "The dashboard overview" },
    { src: "/projects/example/settings.png", alt: "Settings screen", caption: "Configurable project settings" },
  ]}
/>

The explanation can continue here after the gallery.
```

`images` also accepts an array of paths with optional `captions` and a shared `alt` prefix, but image objects are recommended so every image has meaningful alternative text.

## Deployment

The Cloudflare configuration is in `wrangler.jsonc`.

```sh
npm run build
npm run deploy
```
