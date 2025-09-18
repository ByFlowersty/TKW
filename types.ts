export interface IndexingResult {
  category: string;
  title: string;
  summary: string;
  keywords: string[];
  relevanceScore: number; // A value between 0 and 1
}

export interface DocumentData extends IndexingResult {
  id: string;
  created_at: string;
  fileUrl: string;
  fileName: string;
  userId: string;
  authorEmail?: string; // Optional: used in explore view
}