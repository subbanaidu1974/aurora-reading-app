import { Flashcard } from './flashcard.model';

export interface Deck {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  cards: Flashcard[];
}
