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
 *       │   │   ├── project.md
 *       │   │   ├── thumbnail.webp
 *       │   │   └── ...
 *       │   └── optional-flat-project.md
 *       ├── photos/
 *       │   └── photo.webp
 *       ├── resume.pdf
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
const photosRoot = join(dataRepo, "photos");
const resumeSource = join(dataRepo, "resume.pdf");
const textSource = join(dataRepo, "text.ts");

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
  await requirePath(photosRoot, "photos directory");
  await requirePath(resumeSource, "resume");
  await requirePath(textSource, "text data");

  // Remove previously synced content so deleted or renamed data does not
  // leave stale files behind. These destinations are gitignored.
  await rm(contentRoot, { recursive: true, force: true });
  await rm(publicRoot, { recursive: true, force: true });

  await mkdir(contentRoot, { recursive: true });
  await mkdir(publicRoot, { recursive: true });

  await cp(textSource, join(rootDir, "src", "data", "text.ts"));
  await cp(resumeSource, join(rootDir, "public", "resume.pdf"));

  const existingPublicFiles = await readdir(join(rootDir, "public"), { withFileTypes: true });
  for (const entry of existingPublicFiles) {
    if (entry.isFile() && /^photo\./i.test(entry.name)) {
      await rm(join(rootDir, "public", entry.name), { force: true });
    }
  }

  const photoEntries = await readdir(photosRoot, { withFileTypes: true });
  for (const entry of photoEntries) {
    if (!entry.isFile()) continue;
    await cp(join(photosRoot, entry.name), join(rootDir, "public", entry.name));
    console.log(`[sync] photo ${entry.name}`);
  }

  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const projectEntries = entries
    .filter((entry) => entry.isDirectory() || (entry.isFile() && entry.name.toLowerCase().endsWith(".md")))
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
    const projectFile = join(projectRoot, "project.md");

    if (!(await exists(projectFile))) {
      console.warn(`[skip] ${projectName}: missing project.md`);
      continue;
    }

    const contentDestination = join(contentRoot, `${projectName}.md`);
    const assetDestination = join(publicRoot, projectName);

    // Copy the project's Markdown entry.
    await cp(projectFile, contentDestination);

    // Copy the project directory as its public asset directory,
    // excluding project.md itself.
    const projectEntries = await readdir(projectRoot, {
      withFileTypes: true,
    });

    const assets = projectEntries.filter((projectEntry) => projectEntry.name !== "project.md");

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
