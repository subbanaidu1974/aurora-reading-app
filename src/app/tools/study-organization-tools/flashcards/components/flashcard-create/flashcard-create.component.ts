import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DeckService } from '../../services/deck.service';
import { CategoryService } from '../../services/category.service';
import { FlashcardService } from '../../services/flashcard.service';
import { Flashcard } from '../../models/flashcard.model';
import { combineLatest, map } from 'rxjs';
import { Category } from '../../models/category.model';

@Component({
  selector: 'fc-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './flashcard-create.component.html',
  styleUrls: ['./flashcard-create.component.scss']
})
export class FlashcardCreateComponent {
    currentCardIndex: number = 0;
  form = this.fb.group({ frontText: ['', [Validators.required, Validators.maxLength(220)]], backText: ['', [Validators.required, Validators.maxLength(500)]], imageUrl: [''], categoryId: ['', Validators.required], deckId: ['', Validators.required], audioEnabled: [false] });

  decks$ = this.deckSvc.decks$;
  categories$ = this.catSvc.categories$;

  /** Combined categories: seeded categories plus any category IDs discovered on existing decks */
  availableCategories$ = combineLatest([this.catSvc.categories$, this.deckSvc.decks$]).pipe(
    map(([cats, decks]) => {
      const byId = new Map<string, Category>();
      cats.forEach(c => byId.set(c.id, c));
      decks.forEach(d => {
        if (d.categoryId && !byId.has(d.categoryId)) {
          byId.set(d.categoryId, { id: d.categoryId, name: d.categoryId, color: '#FFF8E1', icon: 'label' });
        }
      });
      return Array.from(byId.values());
    })
  );

  selectedDeck: any = null;
  flipped: boolean = false;

  constructor(private fb: FormBuilder, private deckSvc: DeckService, private catSvc: CategoryService, private fcSvc: FlashcardService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      const deckId = params['deckId'];
      if (deckId) {
        this.selectedDeck = this.deckSvc.get(deckId);
        this.form.patchValue({ deckId });
        if (this.selectedDeck?.categoryId) {
          this.form.patchValue({ categoryId: this.selectedDeck.categoryId });
        }
        this.currentCardIndex = 0;
        this.flipped = false;
      } else {
        this.selectedDeck = null;
        this.currentCardIndex = 0;
        this.flipped = false;
      }
    });
  }

  add() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const card: Flashcard = { id: 'fc_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8), frontText: v.frontText.trim(), backText: v.backText.trim(), imageUrl: v.imageUrl || undefined, audioEnabled: !!v.audioEnabled, categoryId: v.categoryId, deckId: v.deckId };
    this.fcSvc.add(v.deckId, card);
    this.form.reset();
    // If you want to keep deck/category pre-filled after reset, patch those values back
    if (this.selectedDeck) {
      this.form.patchValue({ deckId: this.selectedDeck.id });
      // Also update categoryId if deck has a category
      if (this.selectedDeck.categoryId) {
        this.form.patchValue({ categoryId: this.selectedDeck.categoryId });
      }
    }
    this.currentCardIndex = this.selectedDeck?.cards?.length ? this.selectedDeck.cards.length - 1 : 0;
    this.flipped = false;
  }

  nextCard() {
    if (!this.selectedDeck?.cards?.length) return;
    this.currentCardIndex = (this.currentCardIndex + 1) % this.selectedDeck.cards.length;
    this.flipped = false;
  }

  prevCard() {
    if (!this.selectedDeck?.cards?.length) return;
    this.currentCardIndex = (this.currentCardIndex - 1 + this.selectedDeck.cards.length) % this.selectedDeck.cards.length;
    this.flipped = false;
  }

  flipCard() {
    this.flipped = !this.flipped;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.selectedDeck || !this.selectedDeck.cards?.length) return;
    if (event.key === 'ArrowRight') {
      this.nextCard();
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.prevCard();
      event.preventDefault();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      // Space toggles flip when focus isn't on an input
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return;
      this.flipCard();
      event.preventDefault();
    }
  }
}
