/**
 * Sync private portfolio data from the sibling portfolio-data repository.
 *
 * Expected layout:
 *
 *   parent/
 *   ├── portfolio/
 *   │   ├── sync-data.mjs
 *   │   ├── src/content/projects/
 *   │   ├── src/data/text.ts
 *   │   └── public/
 *   │
 *   └── portfolio-data/
 *       ├── projects/
 *       │   ├── project-name/
 *       │   │   ├── project.md (or project.mdx)
 *       │   │   ├── thumbnail.webp
 *       │   │   └── ...
 *       │   └── optional-flat-project.md(x)
 *       ├── public/
 *       │   ├── photo.webp
 *       │   ├── favicon.ico
 *       │   └── ...
 *       └── text.ts
 *
 * Usage:
 *   npm run sync-data
 */

import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");

const dataRepo = resolve(rootDir, "..", "portfolio-data");
const sourceRoot = join(dataRepo, "projects");
const publicSource = join(dataRepo, "public");
const textSource = join(dataRepo, "text.ts");
const typesSource = join(dataRepo, "types.ts");

const contentRoot = join(rootDir, "src", "content", "projects");
const publicRoot = join(rootDir, "public", "projects");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function requirePath(path, label) {
  if (!(await exists(path))) {
    throw new Error(`Missing ${label}: ${path}`);
  }
}

async function main() {
  if (!(await exists(dataRepo))) {
    throw new Error(
      [
        "Portfolio data repository was not found.",
        "",
        `Expected: ${dataRepo}`,
        "",
        "Clone portfolio-data next to the portfolio repository:",
        "",
        "  parent/",
        "  ├── portfolio/",
        "  └── portfolio-data/",
      ].join("\n"),
    );
  }

  await requirePath(sourceRoot, "projects directory");
  await requirePath(publicSource, "public directory");
  await requirePath(textSource, "text data");
  await requirePath(typesSource, "types data");

  // Remove previously synced content so deleted or renamed data does not
  // leave stale files behind. These destinations are gitignored.
  await rm(contentRoot, { recursive: true, force: true });
  await rm(publicRoot, { recursive: true, force: true });

  await mkdir(contentRoot, { recursive: true });
  await mkdir(publicRoot, { recursive: true });

  await cp(textSource, join(rootDir, "src", "data", "text.ts"));
  await cp(typesSource, join(rootDir, "src", "data", "types.ts"));

  const publicDestination = join(rootDir, "public");
  const publicEntries = await readdir(publicSource, { withFileTypes: true });
  const publicNames = new Set(publicEntries.map((entry) => entry.name));
  const protectedPublicNames = new Set([".assetsignore", "projects", "robots.txt"]);

  // Keep repository-owned files such as robots.txt and remove stale files from previous syncs.
  const existingPublicEntries = await readdir(publicDestination, { withFileTypes: true });
  for (const entry of existingPublicEntries) {
    if (!protectedPublicNames.has(entry.name) && !publicNames.has(entry.name)) {
      await rm(join(publicDestination, entry.name), { recursive: true, force: true });
    }
  }

  for (const entry of publicEntries) {
    const source = join(publicSource, entry.name);
    const destination = join(publicDestination, entry.name);
    await rm(destination, { recursive: true, force: true });
    await cp(source, destination, { recursive: true });
    console.log(`[sync] public/${entry.name}`);
  }

  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const projectEntries = entries
    .filter(
      (entry) =>
        entry.isDirectory() ||
        (entry.isFile() && [".md", ".mdx"].includes(entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase())),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  let projectCount = 0;

  for (const entry of projectEntries) {
    if (entry.isFile()) {
      await cp(join(sourceRoot, entry.name), join(contentRoot, entry.name));
      console.log(`[sync] ${entry.name}`);
      projectCount++;
      continue;
    }

    const projectName = entry.name;
    const projectRoot = join(sourceRoot, projectName);
    const mdxProjectFile = join(projectRoot, "project.mdx");
    const markdownProjectFile = join(projectRoot, "project.md");
    const projectFile = (await exists(mdxProjectFile)) ? mdxProjectFile : markdownProjectFile;

    if (!(await exists(projectFile))) {
      console.warn(`[skip] ${projectName}: missing project.md or project.mdx`);
      continue;
    }

    const contentExtension = projectFile.endsWith(".mdx") ? ".mdx" : ".md";
    const contentDestination = join(contentRoot, `${projectName}${contentExtension}`);
    const assetDestination = join(publicRoot, projectName);

    // Copy the project's Markdown entry.
    await cp(projectFile, contentDestination);

    // Copy the project directory as its public asset directory,
    // excluding the project content file itself.
    const projectEntries = await readdir(projectRoot, {
      withFileTypes: true,
    });

    const assets = projectEntries.filter((projectEntry) => !["project.md", "project.mdx"].includes(projectEntry.name));

    if (assets.length > 0) {
      await mkdir(assetDestination, { recursive: true });

      for (const asset of assets) {
        await cp(join(projectRoot, asset.name), join(assetDestination, asset.name), { recursive: true });
      }
    }

    console.log(`[sync] ${projectName}`);
    projectCount++;
  }

  console.log(`\nSynced ${projectCount} project${projectCount === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(`\nProject sync failed:\n${error.message}`);
  process.exitCode = 1;
});
