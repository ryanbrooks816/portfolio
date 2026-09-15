export type ExperienceEntry = {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  content:
    | {
        layout: "bullets";
        items: string[];
      }
    | {
        layout: "tags";
        items: string[];
      };
};
