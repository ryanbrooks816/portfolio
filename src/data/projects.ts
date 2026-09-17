import { getCollection, render, type CollectionEntry } from "astro:content";

export const PROJECTS_LINK = "/projects";

export type Project = CollectionEntry<"projects">;

export async function getProjects() {
  return await getCollection("projects");
}

export async function getProjectById(id: string) {
  const projects = await getProjects();
  return projects.find((p) => p.id === id);
}

export async function renderProject(project: CollectionEntry<"projects">) {
  return await render(project);
}

/**
 * Resolves project links to handle both absolute and relative URLs
 * @param url - The link URL (can be absolute or relative)
 * @param projectSlug - The project slug for relative path resolution
 * @returns Properly formatted URL
 */
function resolveProjectLink(url: string, projectSlug: string): string {
  // Keep absolute URLs and root-relative paths as-is.
  if (/^(https?:)?\/\//.test(url)) {
    return url;
  }
  if (url.startsWith("/")) {
    return url;
  }

  // For relative URLs, prefix with project's subfolder path
  return `${PROJECTS_LINK}/${projectSlug}/${url}`;
}

/**
 * Get appropriate icon for different link types
 * @param linkKey - The key representing the link type (github, demo, etc.)
 * @returns Icon name string
 */
function getLinkIcon(linkKey: string): string {
  const icons: Record<string, string> = {
    github: "mdi:github",
    demo: "mdi:open-in-new",
    paper: "mdi:file-document",
    case_study: "mdi:clipboard-text",
    report: "mdi:chart-box",
    technical_details: "mdi:cog",
    live: "mdi:open-in-new",
    website: "mdi:web",
    documentation: "mdi:book-open",
    source: "mdi:code-tags",
  };
  return icons[linkKey] || "mdi:link";
}

/**
 * Format link labels for display
 * @param linkKey - The raw link key from project data
 * @returns Formatted, human-readable label
 */
function formatLinkLabel(linkKey: string): string {
  const specialCases: Record<string, string> = {
    github: "GitHub",
    case_study: "Case Study",
    technical_details: "Technical Details",
  };

  if (specialCases[linkKey]) {
    return specialCases[linkKey];
  }

  // Convert snake_case/kebab-case to Title Case
  return linkKey
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format project dates consistently
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 2024")
 */
export function formatProjectDate(date?: Date): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    // Content dates are calendar dates. Keep them in UTC so a local timezone
    // cannot turn the first day of a month into the previous month.
    timeZone: "UTC",
  }).format(date);
}

/**
 * Format project date range
 * @param startDate - Project start date
 * @param endDate - Project end date (optional)
 * @returns Formatted date range (e.g., "Jan 2024 – Present" or "Jan 2024 – Mar 2024")
 */
export function formatProjectDateRange(startDate?: Date, endDate?: Date): string {
  const start = formatProjectDate(startDate);
  if (!start) return "";

  if (endDate) {
    const end = formatProjectDate(endDate);
    return `${start} – ${end}`;
  }

  return `${start} – Present`;
}

/**
 * Get project URL path
 * @param project - Project entry
 * @returns URL path for the project
 */
export function getProjectUrl(project: Project): string {
  return `/projects/${project.id}`;
}

/**
 * Check if project has any external links
 * @param project - Project entry
 * @returns True if project has external links
 */
export function hasProjectLinks(project: Project): boolean {
  return !!(project.data.links && Object.keys(project.data.links).length > 0);
}

/**
 * Get all project links with resolved URLs and formatted labels
 * @param project - Project entry
 * @returns Array of link objects with url, label, icon, and isPrimary
 */
export function getProjectLinks(project: Project): Array<{
  key: string;
  url: string;
  label: string;
  icon: string;
  isPrimary: boolean;
}> {
  if (!hasProjectLinks(project)) return [];

  return Object.entries(project.data.links!).map(([key, url], index) => ({
    key,
    url: resolveProjectLink(url, project.id),
    label: formatLinkLabel(key),
    icon: getLinkIcon(key),
    isPrimary: index === 0, // First link is considered primary
  }));
}

/**
 * Get project's primary (first) link
 * @param project - Project entry
 * @returns Primary link object or null
 */
export function getPrimaryProjectLink(project: Project) {
  const links = getProjectLinks(project);
  return links.find((link) => link.isPrimary) || null;
}

/**
 * Resolve project thumbnail URL
 * @param project - Project entry
 * @returns Resolved thumbnail URL or undefined
 */
export function getProjectThumbnail(project: Project): string | undefined {
  if (!project.data.thumbnail) return undefined;
  return resolveProjectLink(project.data.thumbnail, project.id);
}
