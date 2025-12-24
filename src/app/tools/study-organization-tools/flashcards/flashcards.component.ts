import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent {
  // Reset to minimal placeholder — advanced features moved to standalone components.
  placeholder = true;
}
