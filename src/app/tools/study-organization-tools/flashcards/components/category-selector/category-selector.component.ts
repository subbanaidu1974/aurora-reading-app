import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../services/category.service';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'fc-category-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent {
  @Input() selectedId?: string | null;
  @Output() selection = new EventEmitter<string | null>();

  // Map category ids/names to image icon paths (place icons under src/assets/icons/categories/)
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
  // e.g. math, science, english, history, art, languages, geography, computer-science
  // These will be used if category ids/names match these slugs
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
    // also support legacy/simple ids from CategoryService
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


  categories$: Observable<Category[]> = this.catSvc.categories$.pipe(
    map(cats => cats.map(cat => {
      const slug = (cat.id || (cat.name || '').toLowerCase().replace(/\s+/g,'-')).toLowerCase();
      const img = this.iconMap[cat.id] || this.iconMap[slug] || this.subjectMap[slug] || `/assets/icons/categories/${slug}.svg`;
      return { ...cat, iconImage: img };
    }))
  );

  constructor(private catSvc: CategoryService) {}

  select(id: string | null) {
    this.selectedId = id;
    this.selection.emit(id);
  }

  onKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(id);
    }
  }
}

