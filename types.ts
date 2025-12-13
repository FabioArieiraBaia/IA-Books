
export type BookSize = 'apostila' | 'ebook' | 'livro';

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imagePrompt?: string;
  imageUrl?: string;
  hasError?: boolean; // New: Tracks if generation failed
}

export interface Book {
  id: string;
  title: string;
  author: string; // User or "IA Agent"
  topic: string;
  type: BookSize;
  description: string;
  coverImagePrompt?: string;
  coverUrl?: string;
  chapters: Chapter[];
  status: 'planning' | 'generating_assets' | 'writing' | 'review' | 'completed' | 'failed';
  createdAt: number;
  currentAction?: string; // For progress display
  progress?: number; // 0-100
  
  // Metadata for Server/Public readiness
  isPublic: boolean; // True only after final confirmation
  tags?: string[];
  category?: string;
  language?: string; // 'pt' | 'en'
  pageCountEstimate?: number;
  views?: number;
  likes?: number;
  lastModified?: number;
  authorId?: string; // To link to Auth User
}

export interface AgentStatus {
  name: string;
  role: 'planner' | 'art_director' | 'writer' | 'reviewer' | 'metadata';
  status: 'idle' | 'working' | 'finished' | 'error';
  message: string;
}

export interface ReadingProgress {
  bookId: string;
  lastChapterId: string;
  percentage: number;
  lastReadAt: number;
}

export interface UserProfile {
  id: string; // Email or UUID
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  favorites: string[]; // Book IDs
  readingProgress: ReadingProgress[];
  createdBooks: string[]; // Book IDs
  isAdmin?: boolean;
}
