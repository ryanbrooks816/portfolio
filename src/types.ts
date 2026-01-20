export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  type: "project" | "research" | "professional";
  date: string; // YYYY-MM format
  featured?: boolean;
  highlights: string[];
  links: {
    github?: string;
    demo?: string;
    paper?: string;
    [key: string]: string | undefined;
  };
  private?: boolean;
  passwordHash?: string;
};

export type Skill = {
  name: string;
  abbrev?: string;
  level?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
};
