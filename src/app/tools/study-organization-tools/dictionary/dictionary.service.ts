import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DictionaryResult {
  word: string;
  phonetics: Array<{ text?: string; audio?: string }>;
  meanings: Array<{
    partOfSpeech?: string;
    definitions: Array<{ definition: string; example?: string; synonyms?: string[] }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
  private HISTORY_KEY = 'aurora_dictionary_history';
  private FAV_KEY = 'aurora_dictionary_favorites';

  constructor(private http: HttpClient) {}

  lookup(word: string): Observable<DictionaryResult[] | null> {
    if (!word || !word.trim()) return of(null);
    const url = `${this.API}/${encodeURIComponent(word.trim())}`;
    return this.http.get<any[]>(url).pipe(
      map(res => (res || []).map(r => ({
        word: r.word,
        phonetics: (r.phonetics || []).map((p: any) => ({ text: p.text, audio: p.audio })),
        meanings: (r.meanings || []).map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: (m.definitions || []).map((d: any) => ({ definition: d.definition, example: d.example, synonyms: d.synonyms }))
        }))
      })) ),
      catchError(() => of(null))
    );
  }

  // History management
  getHistory(): string[] {
    try { return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]'); } catch { return []; }
  }
  addHistory(word: string) {
    if (!word) return;
    const h = this.getHistory();
    const idx = h.indexOf(word);
    if (idx !== -1) h.splice(idx, 1);
    h.unshift(word);
    while (h.length > 50) h.pop();
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(h));
  }
  clearHistory() { localStorage.removeItem(this.HISTORY_KEY); }

  // Favorites management: store map word -> result
  getFavorites(): Record<string, DictionaryResult> {
    try { return JSON.parse(localStorage.getItem(this.FAV_KEY) || '{}'); } catch { return {}; }
  }
  toggleFavorite(word: string, data?: DictionaryResult) {
    const fav = this.getFavorites();
    if (fav[word]) { delete fav[word]; }
    else if (data) { fav[word] = data; }
    localStorage.setItem(this.FAV_KEY, JSON.stringify(fav));
  }
  isFavorite(word: string) { return !!this.getFavorites()[word]; }
}
