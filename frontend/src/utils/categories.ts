import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  "Education",
  "Healthcare",
  "Technology",
  "New Tech",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Education: "bg-blue-50 text-blue-700",
  Healthcare: "bg-rose-50 text-rose-700",
  Technology: "bg-violet-50 text-violet-700",
  "New Tech": "bg-violet-50 text-violet-700",
};
