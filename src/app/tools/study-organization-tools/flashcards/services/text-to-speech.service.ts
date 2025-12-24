import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextToSpeechService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? (window as any).speechSynthesis : null;
  private utterance: SpeechSynthesisUtterance | null = null;

  speak(text: string, rate = 0.85, lang = 'en-US', pitch = 1) {
    if (!this.synth) return;
    try {
      this.stop();
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = rate;
      this.utterance.lang = lang;
      this.utterance.pitch = pitch;
      this.synth.speak(this.utterance);
    } catch (e) {}
  }

  stop() { try { this.synth?.cancel(); } catch (e) {} this.utterance = null; }

  isSpeaking() { return !!this.synth && this.synth.speaking; }
}
