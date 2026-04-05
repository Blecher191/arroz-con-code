export type Category = "Education" | "Healthcare" | "Technology" | "New Tech";

export type FeedCategory = "All" | Category;

export interface Post {
  id: number;
  title: string;
  body: string;
  category: Category;
  createdAt: string;
  authorUsername: string;
  authorDisplayName?: string;
  locationName?: string;
  type?: "post" | "article";
}
