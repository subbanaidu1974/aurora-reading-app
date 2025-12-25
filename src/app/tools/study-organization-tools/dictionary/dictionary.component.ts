import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { DictionaryService, DictionaryResult } from './dictionary.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'aurora-dictionary',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatListModule],
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss']
})
export class DictionaryComponent {
  term = '';
  loading = false;
  results: DictionaryResult[] | null = null;
  error = '';

  history: string[] = [];
  favorites: Record<string, DictionaryResult> = {};

  private audio?: HTMLAudioElement;

  constructor(private dict: DictionaryService) {
    this.history = this.dict.getHistory();
    this.favorites = this.dict.getFavorites();
  }

  search(term?: string) {
    const q = (term || this.term || '').trim();
    if (!q) return;
    this.loading = true;
    this.error = '';
    this.dict.lookup(q).subscribe(res => {
      this.loading = false;
      if (!res || !res.length) { this.results = null; this.error = 'No definition found.'; return; }
      this.results = res;
      this.term = q;
      this.dict.addHistory(q);
      this.history = this.dict.getHistory();
      this.favorites = this.dict.getFavorites();
    }, () => { this.loading = false; this.error = 'Lookup failed.'; });
  }

  playAudio(url?: string) {
    if (!url) return;
    try {
      if (this.audio) { this.audio.pause(); this.audio = undefined; }
      this.audio = new Audio(url);
      this.audio.play().catch(() => {});
    } catch (e) { /* noop */ }
  }

  toggleFav() {
    if (!this.results || !this.results.length) return;
    const r = this.results[0];
    this.dict.toggleFavorite(r.word, r);
    this.favorites = this.dict.getFavorites();
  }

  useHistory(word: string) { this.term = word; this.search(word); }
  useFavorite(word: string) { this.term = word; this.search(word); }

  favoritesKeys(): string[] { return Object.keys(this.favorites || {}); }
}

