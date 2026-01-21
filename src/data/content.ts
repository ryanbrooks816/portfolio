import projectsJson from "./projects.json";
import type { Project } from "../types";

export const projects: Project[] = projectsJson as Project[];

export const omni = [
  "Developed 15+ full-stack websites for small businesses using HTML, CSS, JavaScript, jQuery, PHP, and MySQL.",
  "Managed full project lifecycle from UI/UX design, backend development, content structure, deployment, and codebase optimization.",
  "Improved Lighthouse performance and SEO scores through responsive refactors, caching, content rewrites, and structured data implementation.",
  "Collaborated with clients on actionable development plans through iterative feedback and communication.",
  "Maintained and expanded internal automation software with customizable navbars, security features, and calendar modules, reducing project setup time by 2-3 weeks.",
];

export const coursework = [
  "Operating Systems",
  "Computer Architecture",
  "Algorithms and Data Structures",
  "Database Systems",
  "Scientific Computing",
  "Machine Learning",
  "Numerical Linear Algebra",
  "Optimization",
];

export const interests = [
  "Full-Stack Architecture & Scalability",
  "Database Systems",
  "LLM Reliability / Developer Tooling",
  "Computer Vision",
  "Machine Learning",
  "Numerical Methods & Optimization",
];

export const skills = {
  languages: ["Python", "Java", "C/C++", "Rust", "JavaScript/TS", "PHP"],
  frontend: ["HTML", "CSS", "React", "Vue", "jQuery", "Tailwind"],
  backend: ["Node.js", "REST APIs", "Flask", "SQL"],
  devops: ["Cloudflare", "Firebase", "cPanel", "Git", "Docker"],
  ml: ["NumPy", "MATLAB", "Weights & Biases"],
  product_growth: ["SEO", "WordPress", "Google Analytics", "Lighthouse", "JSON-LD"],
};
