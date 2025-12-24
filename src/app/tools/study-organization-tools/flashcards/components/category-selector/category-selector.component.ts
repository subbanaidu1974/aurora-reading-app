import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../services/category.service';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

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

  categories$: Observable<Category[]> = this.catSvc.categories$;

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

