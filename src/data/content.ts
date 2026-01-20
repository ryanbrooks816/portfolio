import type { Project } from "../types";

export const projects: Project[] = [
  {
    slug: "portfolio-site-2025",
    title: "Portfolio Site (This Site)",
    description: "Modern Astro-built portfolio highlighting projects, research, and systems work.",
    tags: ["Astro", "Tailwind", "Cloudflare"],
    type: "project",
    date: "2025-01",
    featured: true,
    highlights: [
      "Fast static-first architecture",
      "Project + research case study layout",
      "Clean content collections for scalable updates",
    ],
    links: {
      github: "https://github.com/ryanbrooks816",
      demo: "#",
    },
    private: false,
  },

  {
    slug: "llm-reliability-cross-layer-dep-graph",
    title: "LLM Reliability for Full-Stack Codebases",
    description:
      "Research prototype proposing a cross-layer dependency graph to improve correctness of LLM changes across frontend, backend, and database layers.",
    tags: ["Research", "LLMs", "Databases", "Full-Stack Systems"],
    type: "research",
    date: "2025-09",
    featured: true,
    highlights: [
      "Cross-layer dependency modeling with DB focus",
      "Built evaluation pipeline to measure correctness",
      "Implemented frontend visualization prototype",
    ],
    links: {
      github: "https://github.com/ryanbrooks816",
      paper: "#",
    },
    private: false,
  },

  {
    slug: "scrabble-board-classification",
    title: "Scrabble Board Classification",
    description:
      "Computer vision pipeline to detect and rectify a Scrabble board, segment tiles, and classify letters using PCA (SVD) + k-NN.",
    tags: ["Computer Vision", "PCA", "SVD", "Python"],
    type: "project",
    date: "2025-12",
    featured: true,
    highlights: [
      "Perspective rectification + grid segmentation",
      "PCA dimensionality reduction via SVD",
      "90-94% accuracy on sample data",
    ],
    links: {
      github: "https://github.com/ryanbrooks816",
      demo: "#",
    },
    private: false,
  },

  {
    slug: "games-support-ticketing-db-system",
    title: "Games & Support Ticketing Database System",
    description:
      "Led a team to build a MySQL + PHP full-stack app for managing a games database and end-to-end support ticketing workflows.",
    tags: ["PHP", "MySQL", "Full-Stack", "Team Lead"],
    type: "project",
    date: "2025-05",
    featured: false,
    highlights: [
      "Project lead for team of 5",
      "Independently implemented full ticketing system",
      "Oversaw code quality + GitHub collaboration",
      "Led UI/UX design and deployment via cPanel",
    ],
    links: {
      github: "https://github.com/ryanbrooks816",
      demo: "#",
    },
    private: false,
  },

  {
    slug: "ml-research-compiler-optimization",
    title: "ML Research in Compiler Optimization",
    description:
      "Research project classifying program speedup/slowdown from loop transformations using an adapted training pipeline and stratified evaluation.",
    tags: ["Machine Learning", "Research", "Weights & Biases"],
    type: "research",
    date: "2024-12",
    featured: false,
    highlights: [
      "Ran stratified experiments across benchmarks",
      "Hyperparameter tuning to improve generalization",
      "Analysis + report with visualized outcomes",
    ],
    links: {
      github: "https://github.com/ryanbrooks816",
      paper: "#",
    },
    private: false,
  },

  {
    slug: "scientific-computing-library-java",
    title: "Scientific Computing Library",
    description:
      "Java scientific computing library supporting calculus operations, optimization tasks, function approximation, and physics-style computations.",
    tags: ["Java", "Numerical Methods", "OOP"],
    type: "project",
    date: "2024-05",
    featured: false,
    highlights: [
      "OOP design focused on reusable computation modules",
      "Optimization + approximation utilities",
      "Demonstrates algorithm design and numerical methods",
    ],
    links: {
      github: "https://github.com/ryanbrooks816",
      demo: "#",
    },
    private: false,
  },
  {
    slug: "omni-digital-services-websites",
    title: "OMNI Digital Services — Full-Stack Websites",
    description:
      "Developed 15+ production websites for small businesses, improving performance, SEO, and maintainability across deployments.",
    tags: ["PHP", "MySQL", "JavaScript", "SEO", "Web Performance"],
    type: "professional",
    date: "2023-07",
    featured: false,
    highlights: [
      "Owned full lifecycle: UI/UX → backend → deployment",
      "Improved Lighthouse performance and SEO scores",
      "Built/maintained internal website automation platform",
    ],
    links: {
      demo: "https://omnidigitalservices.com/",
    },
    private: false,
  },
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
