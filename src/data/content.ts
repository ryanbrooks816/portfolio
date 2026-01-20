import projectsJson from "./projects.json";
import type { Project } from "../types";

export const projects: Project[] = projectsJson as Project[];

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
  "Systems Engineering",
  "Full-Stack Architecture & Scalability",
  "Database Systems & Data Modeling",
  "LLM Reliability / Developer Tooling",
  "Machine Learning (applied + infrastructure)",
  "Computer Vision",
  "Numerical Methods & Optimization",
  "Performance Engineering",
];

export const skills = {
  languages: ["Python", "Java", "C/C++", "Rust", "JavaScript", "PHP"],
  frontend: ["HTML", "CSS", "React", "Vue", "jQuery", "Tailwind"],
  backend: ["Node.js", "REST APIs"],
  databases: ["MySQL", "SQLite"],
  cloud_devops: ["Cloudflare", "Firebase", "cPanel", "Git"],
  data_ml: ["NumPy", "MATLAB", "Weights & Biases"],
  practices: ["Agile/Scrum", "Technical Writing"],
  product_growth: ["SEO", "WordPress"],
};
