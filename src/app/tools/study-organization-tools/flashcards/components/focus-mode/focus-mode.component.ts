import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flashcard } from '../../models/flashcard.model';

@Component({
  selector: 'fc-focus-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus-mode.component.html',
  styleUrls: ['./focus-mode.component.scss']
})
export class FocusModeComponent {
  @Input() card?: Flashcard | null;
  @Input() flipped = false;
  @Output() close = new EventEmitter<void>();
}
