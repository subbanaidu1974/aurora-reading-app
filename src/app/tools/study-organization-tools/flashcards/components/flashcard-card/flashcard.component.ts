import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flashcard } from '../../models/flashcard.model';

@Component({
  selector: 'fc-flashcard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.flipped]="flipped" [attr.aria-pressed]="flipped">
      <div class="inner">
        <div class="front">{{card?.frontText}}</div>
        <div class="back">{{card?.backText}}</div>
      </div>
    </div>
  `,
  styles: [
    `.card{width:100%;height:100%;border-radius:14px;box-shadow:0 8px 30px rgba(8,10,12,0.06);overflow:hidden;border:1px solid rgba(0,0,0,0.03);background:#fff}`,
    `.inner{padding:18px;display:flex;flex-direction:column;gap:8px}.front,.back{font-family:Lexend,system-ui;font-size:18px}`
  ]
})
export class FlashcardComponent {
  @Input() card?: Flashcard | null;
  @Input() flipped = false;
}
