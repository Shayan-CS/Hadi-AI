export interface Flashcard {
  type: string;
  question: string;
  answer: string;
  context?: string;
  arabic?: string | null;
  transliteration?: string | null;
}

export interface BookMetadata {
  id: string;
  title: string;
  coverImage: string;
  description: string;
  totalFlashcards: number;
}

export interface UserFlashcardState {
  userId: string;
  bookId: string;
  hasGeneratedFlashcards: boolean;
  lastAccessedAt: string;
}
