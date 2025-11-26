export type Language = 'pt-BR' | 'en-US';

export interface BookConfig {
  topic: string;
  audience: string;
  tone: string;
  authorName: string;
  language: Language;
}

export interface Section {
  title: string;
  visualConcept: string; // A ideia visual para a IA de imagem
  content?: string; // HTML content
  imageUrl?: string; // Base64 ou URL
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  sections: Section[]; // Nova estrutura aninhada
}

export interface Book {
  title: string;
  subtitle: string;
  config: BookConfig;
  chapters: Chapter[];
  isComplete: boolean;
}

export enum AppStep {
  ONBOARDING = 'ONBOARDING',
  OUTLINE = 'OUTLINE',
  GENERATION = 'GENERATION',
  PREVIEW = 'PREVIEW',
}

export interface GenerationStatus {
  currentChapterTitle: string | null;
  currentSectionTitle: string | null;
  activity: 'thinking' | 'drafting' | 'refining' | 'painting' | 'finished';
  logs: string[];
  progress: number; // 0 to 100
}