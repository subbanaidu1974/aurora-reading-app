import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Deck } from '../models/deck.model';

const STORAGE_KEY = 'aurora:flashcards:decks:v1';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private _decks$ = new BehaviorSubject<Deck[]>(this.load());
  public decks$ = this._decks$.asObservable();

  private load(): Deck[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  private save(decks: Deck[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(decks)); } catch (e) {}
  }

  list(): Deck[] { return [...this._decks$.getValue()]; }

  get(id: string): Deck | undefined { return this.list().find(d => d.id === id); }

  add(deck: Deck) {
    const current = this.list();
    current.push(deck);
    this._decks$.next(current);
    this.save(current);
  }

  update(id: string, patch: Partial<Deck>) {
    const current = this.list();
    const idx = current.findIndex(d => d.id === id);
    if (idx === -1) return;
    current[idx] = { ...current[idx], ...patch };
    this._decks$.next(current);
    this.save(current);
  }

  remove(id: string) {
    const current = this.list().filter(d => d.id !== id);
    this._decks$.next(current);
    this.save(current);
  }

  addCard(deckId: string, card: any) {
    const decks = this.list();
    const d = decks.find(x => x.id === deckId);
    if (!d) return;
    d.cards.push(card);
    this._decks$.next(decks);
    this.save(decks);
  }

  updateCard(deckId: string, cardId: string, patch: Partial<any>) {
    const decks = this.list();
    const d = decks.find(x => x.id === deckId);
    if (!d) return;
    const i = d.cards.findIndex((c: any) => c.id === cardId);
    if (i === -1) return;
    d.cards[i] = { ...d.cards[i], ...patch };
    this._decks$.next(decks);
    this.save(decks);
  }

  removeCard(deckId: string, cardId: string) {
    const decks = this.list();
    const d = decks.find(x => x.id === deckId);
    if (!d) return;
    d.cards = d.cards.filter((c: any) => c.id !== cardId);
    this._decks$.next(decks);
    this.save(decks);
  }
}
