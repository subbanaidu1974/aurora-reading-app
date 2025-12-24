import { Injectable } from '@angular/core';
import { FlashcardService } from './flashcard.service';

@Injectable({ providedIn: 'root' })
export class RepetitionService {
  constructor(private fc: FlashcardService) {}

  // Simple SR algorithm: maintain intervalDays on card.nextReviewDate implicitly
  recordResult(deckId: string, cardId: string, feedback: 'easy'|'ok'|'hard') {
    const card = this.fc.find(deckId, cardId);
    if (!card) return;

    const now = new Date();
    let currentInterval = 1; // default 1 day
    if (card.nextReviewDate) {
      const prev = new Date(card.nextReviewDate);
      const diff = Math.max(1, Math.round((now.getTime() - prev.getTime()) / (1000*60*60*24)));
      currentInterval = diff || 1;
    }

    let nextInterval = currentInterval;
    if (feedback === 'easy') nextInterval = Math.max(1, Math.round(currentInterval * 2));
    else if (feedback === 'ok') nextInterval = Math.max(1, Math.round(currentInterval * 1.2));
    else nextInterval = 1; // hard -> review again tomorrow

    const next = new Date(); next.setDate(next.getDate() + nextInterval);
    this.fc.update(deckId, cardId, { nextReviewDate: next.toISOString(), difficulty: feedback });
  }
}
