import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FontSettings {
  selectedFont: string;
  fontSize: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  backgroundColor: string;
  textColor: string;
  overlayColor: string;
  showReadingGuide: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FontSettingsService {
  private defaultSettings: FontSettings = {
    selectedFont: 'Arial',
    fontSize: 16,
    letterSpacing: 0,
    wordSpacing: 0,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    overlayColor: 'none',
    showReadingGuide: false
  };

  private fontSettingsSubject = new BehaviorSubject<FontSettings>(this.defaultSettings);
  public fontSettings$ = this.fontSettingsSubject.asObservable();

  constructor() {}

  updateSettings(settings: FontSettings) {
    this.fontSettingsSubject.next(settings);
  }

  getCurrentSettings(): FontSettings {
    return this.fontSettingsSubject.value;
  }

  resetSettings() {
    this.fontSettingsSubject.next({ ...this.defaultSettings });
  }
}
