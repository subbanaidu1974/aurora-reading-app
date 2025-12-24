export interface Flashcard {
  id: string;
  frontText: string;
  backText: string;
  imageUrl?: string;
  audioEnabled?: boolean;
  difficulty?: 'easy' | 'ok' | 'hard';
  categoryId: string;
  deckId: string;
  nextReviewDate?: string; // ISO string for persistence
}
