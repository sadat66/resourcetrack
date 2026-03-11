export const SECTIONS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "fundamentals", label: "Fundamentals" },
  { value: "interview-prep", label: "Interview Prep" },
  { value: "other", label: "Other" },
] as const;

export type SectionValue = (typeof SECTIONS)[number]["value"];
