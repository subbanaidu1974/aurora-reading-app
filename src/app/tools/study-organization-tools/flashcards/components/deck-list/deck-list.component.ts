import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DeckService } from '../../services/deck.service';
import { CategoryService } from '../../services/category.service';
import { FlashcardCreateComponent } from '../flashcard-create/flashcard-create.component';
import { combineLatest, map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'fc-deck-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, FlashcardCreateComponent],
  templateUrl: './deck-list.component.html',
  styleUrls: ['./deck-list.component.scss']
})
export class DeckListComponent {
  form = this.fb.group({ name: ['', [Validators.required, Validators.maxLength(80)]], description: [''], categoryId: [''] });
  decks$ = this.deckSvc.decks$;
  categories$ = this.catSvc.categories$;

  // combine decks with their category metadata for easier templating
  decksWithMeta$ = combineLatest([this.decks$, this.categories$]).pipe(
    map(([decks, cats]) => decks.map(d => ({ ...d, category: cats.find(c => c.id === d.categoryId) })))
  );

  constructor(private fb: FormBuilder, private deckSvc: DeckService, private catSvc: CategoryService, private router: Router) {}

  isUrl(val?: string) {
    if (!val) return false;
    // treat absolute/relative asset paths and common URL schemes as image sources
    return /^(https?:|data:|blob:|\/|\.\/|\.\.\/)/.test(val) || /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/.test(val);
  }

  study(deckId: string) {
    this.router.navigate(['/tasks', 'study-organization-tools', 'flashcards', 'study'], { queryParams: { deckId } });
  }

  add() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const deck = { id: 'dk_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8), name: v.name.trim(), description: v.description?.trim(), categoryId: v.categoryId || '', cards: [] };
    this.deckSvc.add(deck);
    this.form.reset();
  }

  remove(id: string) { this.deckSvc.remove(id); }
}
