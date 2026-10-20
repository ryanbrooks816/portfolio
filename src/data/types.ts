export type ExperienceRole = {
  title: string;
  date: string;
  endDate?: string;
};

export type ExperienceEntry = {
  title: string;
  location?: string;
  roles: ExperienceRole[];
  content: {
    bullets?: string[];
    tags?: string[];
  };
};

export type ContactInfo = {
  email: string;
  github: string;
  linkedin: string;
  resume: string;
};

export type AboutContent = {
  intro: string;
  focus: string;
  personal: string;
};

export type ContactSection = {
  heading: string;
  description: string;
  buttonText: string;
};

export type SkillGroup = {
  name: string;
  items: string[];
};

export type PortfolioText = {
  name: string;
  title: string[];
  tagline: string;
  contact: ContactInfo;
  about: AboutContent;
  experience: ExperienceEntry[];
  education: ExperienceEntry[];
  skillsIntro: string;
  researchIntro: string;
  contactSection: ContactSection;
};
