import type { ContentType } from "@/lib/content/schema";

export interface SearchDocument {
  slug: string;
  contentType: ContentType;
  url: string;
  title: string;
  description: string;
  author: string;
  location?: string;
  tags: string[];
  manufacturer?: string;
  model?: string;
  circuit?: string;
  excerpt: string;
}

export type SearchIndex = SearchDocument[];
