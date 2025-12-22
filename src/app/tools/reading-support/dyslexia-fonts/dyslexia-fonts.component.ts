import { Component, OnInit } from '@angular/core';
import { FontSettingsService } from '../../../services/font-settings.service';

@Component({
  selector: 'app-dyslexia-fonts',
  standalone: false,
  templateUrl: './dyslexia-fonts.component.html',
  styleUrls: ['./dyslexia-fonts.component.css']
})
export class DyslexiaFontsComponent implements OnInit {
  // Font settings
  selectedFont: string = 'Arial';
  fontSize: number = 16;
  
  // Spacing settings
  letterSpacing: number = 0;
  wordSpacing: number = 0;
  lineHeight: number = 1.5;
  
  // Color settings
  backgroundColor: string = '#ffffff';
  textColor: string = '#000000';
  overlayColor: string = 'none';
  
  // Reading guide
  showReadingGuide: boolean = false;
  
  // Sample text for preview
  sampleText: string = 'The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate the dyslexia-friendly font settings. You can customize the font, spacing, colors, and more to make reading easier and more comfortable.';
  
  // Available fonts
  fonts = [
    { name: 'OpenDyslexic', value: 'OpenDyslexic' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Tahoma', value: 'Tahoma' },
    { name: 'Georgia', value: 'Georgia' }
  ];
  
  // Background color presets
  backgroundColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Cream', value: '#faf8f3' },
    { name: 'Light Yellow', value: '#fffacd' },
    { name: 'Light Blue', value: '#e6f2ff' },
    { name: 'Light Green', value: '#e8f5e9' },
    { name: 'Light Gray', value: '#f5f5f5' }
  ];
  
  // Overlay color options
  overlayColors = [
    { name: 'None', value: 'none' },
    { name: 'Light Yellow', value: 'rgba(255, 255, 0, 0.1)' },
    { name: 'Light Blue', value: 'rgba(0, 150, 255, 0.1)' },
    { name: 'Light Green', value: 'rgba(0, 255, 0, 0.1)' },
    { name: 'Light Pink', value: 'rgba(255, 192, 203, 0.15)' }
  ];

  constructor(private fontSettingsService: FontSettingsService) {}
  
  ngOnInit() {
    this.loadOpenDyslexicFont();
    this.broadcastSettings();
  }

  broadcastSettings() {
    this.fontSettingsService.updateSettings({
      selectedFont: this.selectedFont,
      fontSize: this.fontSize,
      letterSpacing: this.letterSpacing,
      wordSpacing: this.wordSpacing,
      lineHeight: this.lineHeight,
      backgroundColor: this.backgroundColor,
      textColor: this.textColor,
      overlayColor: this.overlayColor,
      showReadingGuide: this.showReadingGuide
    });
  }
  
  loadOpenDyslexicFont() {
    // Load OpenDyslexic font from CDN
    const link = document.createElement('link');
    link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  getPreviewStyle() {
    this.broadcastSettings();
    return {
      'font-family': this.selectedFont,
      'font-size': this.fontSize + 'px',
      'letter-spacing': this.letterSpacing + 'px',
      'word-spacing': this.wordSpacing + 'px',
      'line-height': this.lineHeight,
      'background-color': this.backgroundColor,
      'color': this.textColor,
      'position': 'relative'
    };
  }
  
  getOverlayStyle() {
    if (this.overlayColor === 'none') {
      return {};
    }
    return {
      'background-color': this.overlayColor
    };
  }
  
  resetSettings() {
    this.selectedFont = 'Arial';
    this.fontSize = 16;
    this.letterSpacing = 0;
    this.wordSpacing = 0;
    this.lineHeight = 1.5;
    this.backgroundColor = '#ffffff';
    this.textColor = '#000000';
    this.overlayColor = 'none';
    this.showReadingGuide = false;
    this.broadcastSettings();
  }
}
