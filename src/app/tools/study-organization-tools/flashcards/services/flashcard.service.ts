import { Injectable } from '@angular/core';
import { DeckService } from './deck.service';
import { Deck } from '../models/deck.model';
import { Flashcard } from '../models/flashcard.model';

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  constructor(private deckSvc: DeckService) {}

  listByDeck(deckId: string): Flashcard[] {
    const deck = this.deckSvc.get(deckId);
    return deck ? [...deck.cards] : [];
  }

  add(deckId: string, card: Flashcard) { this.deckSvc.addCard(deckId, card); }

  update(deckId: string, cardId: string, patch: Partial<Flashcard>) { this.deckSvc.updateCard(deckId, cardId, patch); }

  remove(deckId: string, cardId: string) { this.deckSvc.removeCard(deckId, cardId); }

  find(deckId: string, cardId: string): Flashcard | undefined {
    const deck = this.deckSvc.get(deckId);
    return deck?.cards.find(c => c.id === cardId);
  }

  listDue(deckId: string): Flashcard[] {
    const all = this.listByDeck(deckId);
    const today = new Date(); today.setHours(0,0,0,0);
    return all.filter(c => !c.nextReviewDate || new Date(c.nextReviewDate) <= today);
  }
}
