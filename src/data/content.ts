import { getCollection, render } from "astro:content";

export async function getProjects() {
  return await getCollection("projects");
}

export async function getProjectById(id: string) {
  const projects = await getProjects();
  return projects.find((p) => p.id === id);
}

export async function renderProject(project: any) {
  return await render(project);
}

// Re-export personal content from personal.ts for backwards compatibility
export { omni, coursework, interests, skills } from "./text";
