/**
 * Sync portfolio project content from the sibling portfolio-projects repository.
 *
 * Expected layout:
 *
 *   parent/
 *   ├── portfolio/
 *   │   ├── sync-projects.mjs
 *   │   ├── src/content/projects/
 *   │   └── public/projects/
 *   │
 *   └── portfolio-projects/
 *       └── projects/
 *           ├── project-name/
 *           │   ├── project.md
 *           │   ├── thumbnail.webp
 *           │   └── ...
 *           └── another-project/
 *               ├── project.md
 *               └── thumbnail.webp
 *
 * Each project's project.md is copied to:
 *
 *   src/content/projects/<project-name>.md
 *
 * All other files in the project directory are copied to:
 *
 *   public/projects/<project-name>/
 *
 * Usage:
 *   node scripts/sync-projects.mjs
 */

import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

const projectsRepo = resolve(scriptDir, "..", "portfolio-projects");
const sourceRoot = join(projectsRepo, "projects");

const contentRoot = join(scriptDir, "src", "content", "projects");
const publicRoot = join(scriptDir, "public", "projects");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(sourceRoot))) {
    throw new Error(
      [
        "Portfolio projects repository was not found.",
        "",
        `Expected: ${sourceRoot}`,
        "",
        "Clone portfolio-projects next to the portfolio repository:",
        "",
        "  parent/",
        "  ├── portfolio/",
        "  └── portfolio-projects/",
      ].join("\n"),
    );
  }

  // Remove previously synced content so deleted/renamed projects
  // do not leave stale files behind.
  await rm(contentRoot, { recursive: true, force: true });
  await rm(publicRoot, { recursive: true, force: true });

  await mkdir(contentRoot, { recursive: true });
  await mkdir(publicRoot, { recursive: true });

  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const projectDirs = entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

  let projectCount = 0;

  for (const entry of projectDirs) {
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
