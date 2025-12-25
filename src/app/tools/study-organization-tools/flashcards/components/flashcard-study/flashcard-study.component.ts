import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DeckService } from '../../services/deck.service';
import { CategoryService } from '../../services/category.service';
import { FlashcardService } from '../../services/flashcard.service';
import { RepetitionService } from '../../services/repetition.service';
import { TextToSpeechService } from '../../services/text-to-speech.service';
import { Flashcard } from '../../models/flashcard.model';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'fc-study-mode',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, CategorySelectorComponent],
  templateUrl: './flashcard-study.component.html',
  styleUrls: ['./flashcard-study.component.scss']
})
export class FlashcardStudyComponent {
  private m3Map: Record<string,string> = {
    'notes': 'subject',
    'calendar-tasks': 'calendar_month',
    'mind-mapping': 'device_hub',
    'flashcards': 'auto_stories',
    'flashcards-decks': 'folder',
    'flashcards-cards': 'note_add',
    'flashcards-study': 'menu_book',
    'dictionary': 'search',
    'text-highlighting': 'highlight_alt',
    'text-to-speech': 'record_voice_over',
    'speech-to-text': 'keyboard_voice',
    'dyslexia-fonts': 'text_fields',
    'audiobook-support': 'headphones'
  };

  // Map category ids/names to image icon paths (same as selector)
  private iconMap: Record<string, string> = {
    'notes': '/assets/icons/categories/notes.svg',
    'calendar-tasks': '/assets/icons/categories/calendar.svg',
    'mind-mapping': '/assets/icons/categories/mind-mapping.svg',
    'flashcards': '/assets/icons/categories/flashcards.svg',
    'flashcards-decks': '/assets/icons/categories/decks.svg',
    'flashcards-cards': '/assets/icons/categories/cards.svg',
    'flashcards-study': '/assets/icons/categories/study.svg',
    'dictionary': '/assets/icons/categories/dictionary.svg',
    'text-highlighting': '/assets/icons/categories/highlight.svg',
    'text-to-speech': '/assets/icons/categories/text-to-speech.svg',
    'speech-to-text': '/assets/icons/categories/speech-to-text.svg',
    'dyslexia-fonts': '/assets/icons/categories/dyslexia.svg',
    'audiobook-support': '/assets/icons/categories/audiobook.svg'
  };

  // Subject-specific icons
  private subjectMap: Record<string, string> = {
    'math': '/assets/icons/categories/math.svg',
    'science': '/assets/icons/categories/science.svg',
    'english': '/assets/icons/categories/english.svg',
    'history': '/assets/icons/categories/history.svg',
    'art': '/assets/icons/categories/art.svg',
    'languages': '/assets/icons/categories/languages.svg',
    'geography': '/assets/icons/categories/geography.svg',
    'computer-science': '/assets/icons/categories/computer-science.svg',
    'biology': '/assets/icons/categories/biology.svg',
    'chemistry': '/assets/icons/categories/chemistry.svg',
    'physics': '/assets/icons/categories/physics.svg',
    'economics': '/assets/icons/categories/economics.svg'
    ,
    'social-studies': '/assets/icons/categories/social-studies.svg',
    'arts-humanities': '/assets/icons/categories/arts-humanities.svg',
    'business-finance': '/assets/icons/categories/business-finance.svg',
    'health-medicine': '/assets/icons/categories/health-medicine.svg',
    // support legacy/simple ids from CategoryService
    'health': '/assets/icons/categories/health-medicine.svg',
    'business': '/assets/icons/categories/business-finance.svg',
    'arts': '/assets/icons/categories/arts-humanities.svg',
    'test-prep': '/assets/icons/categories/test-prep.svg',
    'law-government': '/assets/icons/categories/law-government.svg',
    'law': '/assets/icons/categories/law-government.svg',
    'skilled-trades': '/assets/icons/categories/skilled-trades.svg',
    'life-skills': '/assets/icons/categories/life-skills.svg',
    'special-learning-support': '/assets/icons/categories/special-learning-support.svg',
    'learning-support': '/assets/icons/categories/special-learning-support.svg'
  };

  categories$ = this.catSvc.categories$.pipe(
    map(cats => cats.map(cat => {
      const slug = (cat.id || (cat.name||'').toLowerCase().replace(/\s+/g,'-')).toLowerCase();
      const img = this.iconMap[cat.id] || this.iconMap[slug] || this.subjectMap[slug] || `/assets/icons/categories/${slug}.svg`;
      return {
        ...cat,
        m3: this.m3Map[cat.id] || this.m3Map[slug] || 'category',
        iconImage: img
      };
    }))
  );
  decks$ = this.deckSvc.decks$;
  // selected category as subject so other streams can react
  private _selectedCategory$ = new BehaviorSubject<string | undefined>(undefined);
  selectedCategory?: string;
  selectedCategoryName?: string;

  // decks filtered by selected category
  decksForCategory$: Observable<import('../../models/deck.model').Deck[]> = this._selectedCategory$.pipe(
    map(catId => this.deckSvc.list().filter(d => d.categoryId === catId))
  );
  selectedDeck?: string;
  cards: Flashcard[] = [];
  index = 0;
  flipped = false;

  rate = 0.85; // TTS default slow

  constructor(private deckSvc: DeckService, private catSvc: CategoryService, private fcSvc: FlashcardService, private rep: RepetitionService, private tts: TextToSpeechService) {}

  onCategory(id?: string) {
    this.selectedCategory = id;
    this.selectedDeck = undefined;
    this.index = 0;
    this.cards = [];
    this._selectedCategory$.next(id);
    if (id) {
      const sub = this.categories$.subscribe(cats => {
        this.selectedCategoryName = (cats || []).find(x => x.id === id)?.name;
        try { sub.unsubscribe(); } catch (e) { /* noop */ }
      });
    } else {
      this.selectedCategoryName = undefined;
    }
  }

  onBack() {
    this.selectedCategory = undefined;
    this._selectedCategory$.next(undefined);
  }

  onBackToDecks() {
    this.selectedDeck = undefined;
    this.cards = [];
    this.index = 0;
    this.flipped = false;
  }

  onBackToCategoriesFromStudy() {
    // clear deck and then go back to categories
    this.onBackToDecks();
    this.onBack();
  }

  onDeck(deckId: string) { this.selectedDeck = deckId; this.loadCards(deckId); }

  loadCards(deckId: string) { this.cards = this.fcSvc.listByDeck(deckId); this.index = 0; this.flipped = false; }

  flip() { this.flipped = !this.flipped; }

  cardStyle(i: number) {
    const offset = i - this.index;
    const abs = Math.abs(offset);
    const translateY = offset * 8; // px
    const scale = Math.max(0.9, 1 - abs * 0.02);
    const opacity = Math.max(0.12, 1 - abs * 0.14);
    const z = 1000 - i;
    const pointer = i === this.index ? 'auto' : 'none';
    return {
      '--card-translate': `${translateY}px`,
      '--card-scale': `${scale}`,
      '--card-opacity': `${opacity}`,
      'z-index': `${z}`,
      'pointer-events': pointer
    } as any;
  }

  isTop(i: number) { return i === this.index; }

  prev() { if (this.index > 0) { this.index--; this.flipped = false; } }
  next() { if (this.index < this.cards.length - 1) { this.index++; this.flipped = false; } }

  mark(feedback: 'easy'|'ok'|'hard') {
    if (!this.selectedDeck) return;
    const c = this.cards[this.index];
    this.rep.recordResult(this.selectedDeck, c.id, feedback);
    if (feedback !== 'hard') this.next();
  }

  play(side: 'front'|'back') { const c = this.cards[this.index]; if (!c) return; this.tts.speak(side === 'front' ? c.frontText : c.backText, this.rate); }

  // focus mode removed

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
