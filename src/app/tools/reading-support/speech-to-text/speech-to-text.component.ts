import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontSettingsService, FontSettings } from '../../../services/font-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-speech-to-text',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.css']
})
export class SpeechToTextComponent implements OnInit, OnDestroy {
  // Recognition properties
  isListening: boolean = false;
  isPaused: boolean = false;
  transcript: string = '';
  interimTranscript: string = '';
  
  // Settings
  language: string = 'en-US';
  continuous: boolean = true;
  interimResults: boolean = true;
  
  // Font Settings from service
  fontSettings: FontSettings;
  private fontSettingsSubscription: Subscription;
  
  // Recognition instance
  private recognition: any = null;
  recognitionSupported: boolean = false;
  
  // Available languages
  languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
    { code: 'hi-IN', name: 'Hindi (India)' }
  ];

  constructor(
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef,
    private fontSettingsService: FontSettingsService
  ) {
    // Initialize with current font settings
    this.fontSettings = this.fontSettingsService.getCurrentSettings();
  }

  ngOnInit() {
    this.initializeSpeechRecognition();
    this.loadOpenDyslexicFont();
    
    // Subscribe to font settings changes
    this.fontSettingsSubscription = this.fontSettingsService.fontSettings$.subscribe(
      settings => {
        this.fontSettings = settings;
        this.cdr.detectChanges();
      }
    );
  }

  loadOpenDyslexicFont() {
    // Load OpenDyslexic font from CDN
    const link = document.createElement('link');
    link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.fontSettingsSubscription) {
      this.fontSettingsSubscription.unsubscribe();
    }
  }

  initializeSpeechRecognition() {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      this.recognitionSupported = false;
      return;
    }

    this.recognitionSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      this.ngZone.run(() => {
        this.isListening = true;
        this.isPaused = false;
        console.log('✓ Speech recognition started');
        this.cdr.detectChanges();
      });
    };

    this.recognition.onresult = (event: any) => {
      this.ngZone.run(() => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          this.transcript += finalTranscript;
          console.log('Final:', finalTranscript);
        }

        this.interimTranscript = interimTranscript;
        this.cdr.detectChanges();
      });
    };

    this.recognition.onerror = (event: any) => {
      this.ngZone.run(() => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else if (event.error === 'audio-capture') {
          alert('No microphone detected. Please check your microphone settings.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          alert('Recognition error: ' + event.error);
        }
        
        this.isListening = false;
        this.cdr.detectChanges();
      });
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => {
        this.isListening = false;
        this.interimTranscript = '';
        console.log('Speech recognition ended');
        this.cdr.detectChanges();
      });
    };
  }

  startListening() {
    if (!this.recognitionSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!this.recognition) {
      this.initializeSpeechRecognition();
    }

    try {
      this.recognition.lang = this.language;
      this.recognition.start();
      console.log('Starting speech recognition...');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
      this.interimTranscript = '';
    }
  }

  clearTranscript() {
    this.transcript = '';
    this.interimTranscript = '';
  }

  copyToClipboard() {
    if (!this.transcript) {
      alert('No text to copy!');
      return;
    }

    navigator.clipboard.writeText(this.transcript).then(() => {
      alert('Text copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text:', err);
      alert('Failed to copy text to clipboard');
    });
  }

  downloadAsText() {
    if (!this.transcript) {
      alert('No text to download!');
      return;
    }

    const blob = new Blob([this.transcript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'speech-to-text-' + new Date().getTime() + '.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  onLanguageChange() {
    // If currently listening, restart with new language
    if (this.isListening) {
      this.stopListening();
      setTimeout(() => {
        this.startListening();
      }, 100);
    }
  }

  getTranscriptStyle() {
    return {
      'font-family': this.fontSettings.selectedFont,
      'font-size': this.fontSettings.fontSize + 'px',
      'letter-spacing': this.fontSettings.letterSpacing + 'px',
      'word-spacing': this.fontSettings.wordSpacing + 'px',
      'line-height': this.fontSettings.lineHeight,
      'background-color': this.fontSettings.backgroundColor,
      'color': this.fontSettings.textColor
    };
  }

  getOverlayStyle() {
    if (this.fontSettings.overlayColor === 'none') {
      return {};
    }
    return {
      'background-color': this.fontSettings.overlayColor
    };
  }
}
