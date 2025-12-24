import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DeckService } from '../../services/deck.service';
import { CategoryService } from '../../services/category.service';
import { FlashcardService } from '../../services/flashcard.service';
import { RepetitionService } from '../../services/repetition.service';
import { TextToSpeechService } from '../../services/text-to-speech.service';
import { Flashcard } from '../../models/flashcard.model';
import { FocusModeComponent } from '../focus-mode/focus-mode.component';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';

@Component({
  selector: 'fc-study-mode',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatSlideToggleModule, FormsModule, FocusModeComponent, CategorySelectorComponent],
  templateUrl: './flashcard-study.component.html',
  styleUrls: ['./flashcard-study.component.scss']
})
export class FlashcardStudyComponent {
  categories$ = this.catSvc.categories$;
  decks$ = this.deckSvc.decks$;
  selectedCategory?: string;
  selectedDeck?: string;
  cards: Flashcard[] = [];
  index = 0;
  flipped = false;
  disableAnim = false;
  focus = false;

  rate = 0.85; // TTS default slow

  constructor(private deckSvc: DeckService, private catSvc: CategoryService, private fcSvc: FlashcardService, private rep: RepetitionService, private tts: TextToSpeechService) {}

  onCategory(id?: string) {
    this.selectedCategory = id;
    this.selectedDeck = undefined;
    this.index = 0;
    this.cards = [];
  }

  onDeck(deckId: string) { this.selectedDeck = deckId; this.loadCards(deckId); }

  loadCards(deckId: string) { this.cards = this.fcSvc.listByDeck(deckId); this.index = 0; this.flipped = false; }

  flip() { if (!this.disableAnim) { this.flipped = !this.flipped; } else { this.flipped = !this.flipped; } }

  prev() { if (this.index > 0) { this.index--; this.flipped = false; } }
  next() { if (this.index < this.cards.length - 1) { this.index++; this.flipped = false; } }

  mark(feedback: 'easy'|'ok'|'hard') {
    if (!this.selectedDeck) return;
    const c = this.cards[this.index];
    this.rep.recordResult(this.selectedDeck, c.id, feedback);
    if (feedback !== 'hard') this.next();
  }

  play(side: 'front'|'back') { const c = this.cards[this.index]; if (!c) return; this.tts.speak(side === 'front' ? c.frontText : c.backText, this.rate); }

  openFocus() { this.focus = true; }
  closeFocus() { this.focus = false; }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === ' ') { e.preventDefault(); this.flip(); }
    if (e.key === '1') this.mark('hard');
    if (e.key === '2') this.mark('ok');
    if (e.key === '3') this.mark('easy');
  }
}
