import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

@Component({
  selector: 'app-text-to-speech',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.css']
})
export class TextToSpeechComponent implements OnInit, OnDestroy {
  @ViewChild('textDisplay', { static: false }) textDisplay!: ElementRef<HTMLDivElement>;
  
  sampleText: string = 'Welcome to Aurora Text-to-Speech! This tool helps you read text aloud with adjustable speed and voice options. Try changing the settings below and click play to hear how it sounds.';
  
  isPlaying: boolean = false;
  isPaused: boolean = false;
  speechRate: number = 1.0;
  selectedVoice: SpeechSynthesisVoice | null = null;
  availableVoices: SpeechSynthesisVoice[] = [];
  
  currentWordIndex: number = -1;
  words: string[] = [];
  currentPageWords: string[] = [];
  currentPageWordIndex: number = -1;
  pageTexts: Map<number, string> = new Map();
  pageWordRanges: Map<number, { start: number; end: number }> = new Map();
  
  uploadedFileName: string = '';
  isFileUploaded: boolean = false;
  isPdfFile: boolean = false;
  isDragOver: boolean = false;
  
  // PDF specific properties
  pdfDocument: any = null;
  currentPage: number = 1;
  totalPages: number = 0;
  
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private highlightTimer: any = null;
  private boundaryEventFired: boolean = false;
  
  // Chunking for long texts
  private textChunks: string[] = [];
  private currentChunkIndex: number = 0;
  private chunkWordOffsets: number[] = []; // Starting word index for each chunk

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    this.synthesis = window.speechSynthesis;
  }

  ngOnInit() {
    this.loadVoices();
    this.words = this.sampleText.split(' ');
    
    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  ngOnDestroy() {
    this.stop();
  }

  clearFile(event?: Event) {
    // Prevent the click from triggering file upload
    if (event) {
      event.stopPropagation();
    }
    
    // Stop any ongoing speech
    this.stop();
    
    // Reset all file-related properties
    this.uploadedFileName = '';
    this.isFileUploaded = false;
    this.isPdfFile = false;
    
    // Reset PDF-specific properties
    this.pdfDocument = null;
    this.currentPage = 1;
    this.totalPages = 0;
    this.pageTexts.clear();
    this.pageWordRanges.clear();
    this.currentPageWords = [];
    this.currentPageWordIndex = -1;
    
    // Reset text chunks
    this.textChunks = [];
    this.chunkWordOffsets = [];
    this.currentChunkIndex = 0;
    
    // Reset to default sample text
    this.sampleText = 'Welcome to Aurora Text-to-Speech! This tool helps you read text aloud with adjustable speed and voice options. Try changing the settings below and click play to hear how it sounds.';
    this.words = this.sampleText.split(' ');
    this.currentWordIndex = -1;
    
    // Reset playback state
    this.isPlaying = false;
    this.isPaused = false;
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    console.log('✓ File cleared - reset to default text');
    this.cdr.detectChanges();
  }

  loadVoices() {
    this.availableVoices = this.synthesis.getVoices();
    console.log('Available voices:', this.availableVoices.length);
    if (this.availableVoices.length > 0 && !this.selectedVoice) {
      // Prefer local voices for better audio reliability
      const localVoices = this.availableVoices.filter(voice => voice.localService);
      const enUSLocalVoices = localVoices.filter(voice => voice.lang === 'en-US');
      
      // Priority: 1. Local en-US voice, 2. Any local voice, 3. Google US English, 4. Any voice
      const googleUSVoice = this.availableVoices.find(voice => 
        voice.name.includes('Google US English') || 
        (voice.name.includes('Google') && voice.lang === 'en-US')
      );
      
      this.selectedVoice = enUSLocalVoices[0] || localVoices[0] || googleUSVoice || this.availableVoices[0];
      console.log('Selected voice:', this.selectedVoice?.name, '(Local:', this.selectedVoice?.localService + ')');
      this.cdr.detectChanges();
    }
  }

  async onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private async processFile(file: File) {
    if (!file) return;

    this.uploadedFileName = file.name;
    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
      let extractedText = '';

      if (fileType === 'txt') {
        console.log('📄 Reading TXT file...');
        extractedText = await this.readTextFile(file);
        this.isPdfFile = false;
      } else if (fileType === 'pdf') {
        console.log('📕 Reading PDF file...');
        extractedText = await this.readPdfFile(file);
        // isPdfFile is set to true inside readPdfFile
      } else if (fileType === 'doc' || fileType === 'docx') {
        console.log('📘 Reading DOCX file...');
        extractedText = await this.readDocFile(file);
        this.isPdfFile = false;
      } else {
        alert('Unsupported file type. Please upload TXT, PDF, DOC, or DOCX files.');
        return;
      }

      if (extractedText) {
        this.sampleText = extractedText;
        this.words = this.sampleText.split(/\s+/).filter(w => w.length > 0);
        this.isFileUploaded = true;
        console.log('✓ File uploaded successfully');
        console.log('  - File type:', fileType?.toUpperCase());
        console.log('  - isPdfFile:', this.isPdfFile);
        console.log('  - Text length:', this.sampleText.length, 'characters');
        console.log('  - Total words:', this.words.length);
        console.log('  - First 10 words:', this.words.slice(0, 10).join(' '));
        console.log('  - Preview:', this.sampleText.substring(0, 100) + '...');
        this.stop(); // Stop current playback if any
        this.cdr.detectChanges();
      } else {
        console.error('No text extracted from file!');
        alert('Failed to extract text from file. The file may be empty or corrupted.');
      }
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try a different file.');
    }
  }

  private readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async readPdfFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          this.pdfDocument = await pdfjsLib.getDocument({ data: typedArray }).promise;
          this.totalPages = this.pdfDocument.numPages;
          this.isPdfFile = true;
          this.pageTexts.clear();
          this.pageWordRanges.clear();
          
          // Extract text from all pages and store by page number
          let fullText = '';
          let globalWordCount = 0;
          
          for (let i = 1; i <= this.pdfDocument.numPages; i++) {
            const page = await this.pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            let pageText = '';
            
            const pageStartWord = globalWordCount;
            
            textContent.items.forEach((item: any) => {
              pageText += item.str + ' ';
            });
            
            const pageWords = pageText.trim().split(/\s+/).filter(w => w.length > 0);
            globalWordCount += pageWords.length;
            
            this.pageTexts.set(i, pageText.trim());
            this.pageWordRanges.set(i, { start: pageStartWord, end: globalWordCount - 1 });
            fullText += pageText + ' ';
          }

          // Show first page text
          this.showPdfPage(1);
          
          const trimmedText = fullText.trim().replace(/\s+/g, ' ');
          console.log('PDF extracted. Pages:', this.totalPages, 'Total text length:', trimmedText.length);
          console.log('First 200 chars of PDF:', trimmedText.substring(0, 200));
          console.log('Total words:', trimmedText.split(/\s+/).filter(w => w.length > 0).length);
          resolve(trimmedText);
        } catch (error) {
          console.error('PDF parsing error:', error);
          this.isPdfFile = false;
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  showPdfPage(pageNum: number) {
    if (!this.pdfDocument || pageNum < 1 || pageNum > this.totalPages) return;
    
    this.currentPage = pageNum;
    const pageText = this.pageTexts.get(pageNum) || '';
    this.currentPageWords = pageText.split(/\s+/).filter(w => w.length > 0);
    
    // Update current page word index based on global word index
    if (this.currentWordIndex >= 0) {
      const pageRange = this.pageWordRanges.get(pageNum);
      if (pageRange && this.currentWordIndex >= pageRange.start && this.currentWordIndex <= pageRange.end) {
        this.currentPageWordIndex = this.currentWordIndex - pageRange.start;
      } else {
        this.currentPageWordIndex = -1;
      }
    }
    
    this.cdr.detectChanges();
    console.log(`Showing page ${pageNum} with ${this.currentPageWords.length} words`);
  }

  private async readDocFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        try {
          const arrayBuffer = e.target.result;
          console.log('📘 Extracting text from DOCX file...');
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          if (!result.value || result.value.trim().length === 0) {
            console.warn('⚠️ DOCX file appears to be empty');
            alert('The DOCX file appears to be empty or contains no readable text.');
            reject(new Error('Empty DOCX file'));
            return;
          }
          
          console.log('✓ DOCX text extracted successfully');
          console.log('  - Characters:', result.value.length);
          console.log('  - Preview:', result.value.substring(0, 100) + '...');
          
          if (result.messages && result.messages.length > 0) {
            console.log('  - Warnings:', result.messages);
          }
          
          resolve(result.value);
        } catch (error) {
          console.error('❌ DOCX parsing error:', error);
          alert('Failed to read DOCX file. The file may be corrupted or in an unsupported format.');
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('❌ File reading error:', error);
        alert('Failed to read file. Please try again.');
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Split text into chunks (max ~2000 chars per chunk for better compatibility)
  private createTextChunks(text: string): void {
    this.textChunks = [];
    this.chunkWordOffsets = [];
    
    const MAX_CHUNK_LENGTH = 2000;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    let wordOffset = 0;
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
        // Save current chunk
        this.textChunks.push(currentChunk.trim());
        this.chunkWordOffsets.push(wordOffset);
        
        // Update word offset
        const chunkWords = currentChunk.trim().split(/\s+/).filter(w => w.length > 0);
        wordOffset += chunkWords.length;
        
        // Start new chunk
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      this.textChunks.push(currentChunk.trim());
      this.chunkWordOffsets.push(wordOffset);
    }
    
    console.log('📦 Created', this.textChunks.length, 'text chunks');
    this.textChunks.forEach((chunk, i) => {
      console.log(`  Chunk ${i + 1}: ${chunk.length} chars, starts at word ${this.chunkWordOffsets[i]}`);
    });
  }

  play() {
    if (this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
      this.isPlaying = true;
      
      // Resume the highlight timer
      const wordsArray = this.isPdfFile ? this.currentPageWords : this.words;
      const totalWords = wordsArray.length;
      const currentWordIndex = this.isPdfFile ? this.currentPageWordIndex : this.currentWordIndex;
      
      if (currentWordIndex < totalWords - 1) {
        const textToSpeak = this.isPdfFile ? (this.pageTexts.get(this.currentPage) || '') : this.sampleText;
        const textLength = textToSpeak.length;
        const estimatedDurationMs = (textLength / (220 * 4.5 / this.speechRate)) * 60 * 1000;
        const msPerWord = estimatedDurationMs / totalWords;
        
        let wordCounter = currentWordIndex + 1;
        
        this.highlightTimer = setInterval(() => {
          if (this.boundaryEventFired) {
            clearInterval(this.highlightTimer);
            return;
          }
          
          this.ngZone.run(() => {
            if (wordCounter < totalWords) {
              if (this.isPdfFile) {
                this.currentPageWordIndex = wordCounter;
              } else {
                this.currentWordIndex = wordCounter;
              }
              wordCounter++;
              this.cdr.detectChanges();
            } else {
              clearInterval(this.highlightTimer);
            }
          });
        }, msPerWord);
      }
      
      return;
    }

    // Stop any ongoing speech
    this.synthesis.cancel();
    this.isPlaying = true;
    
    // Reset to start
    this.currentWordIndex = 0;
    this.currentPageWordIndex = 0;
    this.currentChunkIndex = 0;
    
    // For PDFs, speak only current page. For other files, use chunking for long texts.
    let textToSpeak = this.sampleText;
    
    if (this.isPdfFile) {
      const pageText = this.pageTexts.get(this.currentPage);
      if (!pageText || pageText.trim().length === 0) {
        console.error('No text for current page!');
        alert('No text found for current page.');
        this.isPlaying = false;
        return;
      }
      textToSpeak = pageText;
      console.log('Speaking PDF page', this.currentPage, '- Words:', this.currentPageWords.length);
      console.log('First 100 chars:', textToSpeak.substring(0, 100));
    } else {
      // For TXT/DOCX, create chunks if text is long
      if (this.sampleText.length > 2000) {
        this.createTextChunks(this.sampleText);
        textToSpeak = this.textChunks[0];
        console.log('📄 Speaking chunk 1 of', this.textChunks.length);
      } else {
        this.textChunks = [this.sampleText];
        this.chunkWordOffsets = [0];
        textToSpeak = this.sampleText;
      }
    }
    
    console.log('Starting playback. isPDF:', this.isPdfFile, 'Words count:', this.isPdfFile ? this.currentPageWords.length : this.words.length);
    console.log('Selected voice:', this.selectedVoice?.name);
    
    if (!textToSpeak || textToSpeak.trim().length === 0) {
      console.error('No text to speak!');
      alert('No text available. Please upload a file first.');
      this.isPlaying = false;
      return;
    }
    
    // Ensure voices are loaded
    if (this.availableVoices.length === 0) {
      console.log('Voices not loaded yet, loading...');
      this.loadVoices();
      if (this.availableVoices.length === 0) {
        console.error('No voices available after loading!');
        alert('No voices available. Please check your browser settings.');
        this.isPlaying = false;
        return;
      }
    }
    
    // Cancel any pending speech first
    this.synthesis.cancel();
    
    // Small delay to ensure cancellation completes
    setTimeout(() => {
      this.startSpeaking(textToSpeak);
    }, 50);
  }

  private startSpeaking(textToSpeak: string) {
    // Create the utterance
    this.utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.utterance.rate = this.speechRate;
    this.utterance.pitch = 1;
    this.utterance.volume = 1;
    this.utterance.lang = 'en-US';
    
    if (this.selectedVoice) {
      this.utterance.voice = this.selectedVoice;
      console.log('🎙️ Voice:', this.utterance.voice?.name, '(Local:', this.utterance.voice?.localService + ')');
      console.log('📝 Text length:', textToSpeak.length, 'chars');
      console.log('⚡ Speed:', this.speechRate + 'x');
    } else {
      // If no voice selected, use first available
      if (this.availableVoices.length > 0) {
        this.utterance.voice = this.availableVoices[0];
        this.selectedVoice = this.availableVoices[0];
        console.log('Using default voice:', this.utterance.voice?.name);
      } else {
        console.warn('No voices available!');
      }
    }
    
    // Track word highlighting with a counter
    let wordCounter = 0;
    this.boundaryEventFired = false;
    
    // Event handlers
    this.utterance.onstart = () => {
      console.log('✓ Speech started successfully');
      wordCounter = 0;
      
      // Start timer-based highlighting as fallback
      const wordsArray = this.isPdfFile ? this.currentPageWords : this.words;
      const totalWords = wordsArray.length;
      
      // Use same formula as speed update for consistency
      // Base: 200 words per minute adjusted by speech rate
      const wordsPerMinute = 200 * this.speechRate;
      const msPerWord = (60 * 1000) / wordsPerMinute;
      
      console.log('⏱ Timer:', Math.round(msPerWord), 'ms/word @', this.speechRate, 'x speed,', totalWords, 'words');
      
      // Clear any existing timer
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer);
      }
      
      // Start highlighting immediately
      if (this.isPdfFile) {
        this.currentPageWordIndex = 0;
      } else {
        this.currentWordIndex = 0;
      }
      console.log('🎯 Initial highlight -', this.isPdfFile ? 'PDF page word' : 'Word', '0');
      this.cdr.detectChanges();
      wordCounter = 1;
      
      // Start timer to highlight remaining words
      this.highlightTimer = setInterval(() => {
        // If boundary events start firing, stop the timer
        if (this.boundaryEventFired) {
          console.log('Boundary events detected - stopping timer');
          clearInterval(this.highlightTimer);
          return;
        }
        
        this.ngZone.run(() => {
          if (wordCounter < totalWords) {
            if (this.isPdfFile) {
              this.currentPageWordIndex = wordCounter;
            } else {
              this.currentWordIndex = wordCounter;
            }
            console.log('🎯 Timer highlight -', this.isPdfFile ? 'PDF word' : 'Word', wordCounter, '/', totalWords);
            wordCounter++;
            this.cdr.detectChanges();
          } else {
            clearInterval(this.highlightTimer);
          }
        });
      }, msPerWord);
    };

    this.utterance.onboundary = (event: SpeechSynthesisEvent) => {
      this.boundaryEventFired = true;
      console.log('🔥 BOUNDARY EVENT:', event.name, 'char:', event.charIndex);
      
      if (event.name === 'word') {
        this.ngZone.run(() => {
          if (this.isPdfFile) {
            this.currentPageWordIndex = wordCounter;
            console.log('→ PDF word:', this.currentPageWordIndex, '/', this.currentPageWords.length);
          } else {
            this.currentWordIndex = wordCounter;
            console.log('→ Word:', this.currentWordIndex, '/', this.words.length);
          }
          
          wordCounter++;
          this.cdr.detectChanges();
        });
      }
    };

    this.utterance.onend = () => {
      this.ngZone.run(() => {
        console.log('Speech chunk/page ended');
        
        // Clean up timer
        if (this.highlightTimer) {
          clearInterval(this.highlightTimer);
          this.highlightTimer = null;
        }
        
        // For PDFs, auto-advance to next page if available
        if (this.isPdfFile && this.currentPage < this.totalPages) {
          console.log('Auto-advancing to page', this.currentPage + 1);
          this.showPdfPage(this.currentPage + 1);
          // Auto-play next page after a short delay
          setTimeout(() => {
            this.play();
          }, 500);
        } 
        // For chunked text (DOCX/TXT), auto-advance to next chunk
        else if (!this.isPdfFile && this.currentChunkIndex < this.textChunks.length - 1) {
          console.log('Auto-advancing to chunk', this.currentChunkIndex + 2, 'of', this.textChunks.length);
          this.currentChunkIndex++;
          // Auto-play next chunk after a short delay
          setTimeout(() => {
            this.playCurrentChunk();
          }, 500);
        }
        else {
          console.log('Reading complete');
          this.isPlaying = false;
          this.isPaused = false;
          this.currentWordIndex = -1;
          this.currentPageWordIndex = -1;
          this.cdr.detectChanges();
        }
      });
    };

    this.utterance.onerror = (event: any) => {
      console.error('Speech synthesis error:', event);
      console.error('Error details:', event.error);
      
      // Clean up timer
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer);
        this.highlightTimer = null;
      }
      
      this.isPlaying = false;
      this.isPaused = false;
      this.currentWordIndex = -1;
      this.currentPageWordIndex = -1;
      this.cdr.detectChanges();
      
      // Only show alert for non-interrupted errors
      if (event.error && event.error !== 'interrupted' && event.error !== 'canceled') {
        alert('Speech error: ' + event.error);
      }
    };

    // Start speaking
    console.log('Calling synthesis.speak() with text length:', textToSpeak.length);
    this.synthesis.speak(this.utterance);
    
    // Fallback: Start highlighting immediately if onstart doesn't fire (common with cloud voices)
    setTimeout(() => {
      if (this.synthesis.speaking) {
        console.log('Synthesis is speaking');
        
        // If onstart hasn't fired yet, start highlighting manually
        if (!this.highlightTimer) {
          console.log('⚠️ onstart event did not fire - starting highlight timer manually');
          const wordsArray = this.isPdfFile ? this.currentPageWords : this.words;
          const totalWords = wordsArray.length;
          const wordsPerMinute = 200 * this.speechRate;
          const msPerWord = (60 * 1000) / wordsPerMinute;
          
          console.log('⏱ Manual timer:', Math.round(msPerWord), 'ms/word @', this.speechRate, 'x speed,', totalWords, 'words');
          
          // Start highlighting immediately
          if (this.isPdfFile) {
            this.currentPageWordIndex = 0;
          } else {
            this.currentWordIndex = 0;
          }
          console.log('🎯 Initial highlight -', this.isPdfFile ? 'PDF page word' : 'Word', '0');
          this.cdr.detectChanges();
          
          let wordCounter = 1;
          
          // Start timer to highlight remaining words
          this.highlightTimer = setInterval(() => {
            if (this.boundaryEventFired) {
              console.log('Boundary events detected - stopping timer');
              clearInterval(this.highlightTimer);
              return;
            }
            
            this.ngZone.run(() => {
              if (wordCounter < totalWords) {
                if (this.isPdfFile) {
                  this.currentPageWordIndex = wordCounter;
                } else {
                  this.currentWordIndex = wordCounter;
                }
                console.log('🎯 Timer highlight -', this.isPdfFile ? 'PDF word' : 'Word', wordCounter, '/', totalWords);
                wordCounter++;
                this.cdr.detectChanges();
              } else {
                clearInterval(this.highlightTimer);
              }
            });
          }, msPerWord);
        }
      } else if (this.synthesis.pending) {
        console.log('Synthesis is pending');
      } else {
        console.error('Synthesis failed to start!');
        this.isPlaying = false;
        alert('Failed to start speech. Please try again.');
      }
    }, 100);
  }

  // Play the current chunk for long DOCX/TXT files
  private playCurrentChunk() {
    const textToSpeak = this.textChunks[this.currentChunkIndex];
    if (!textToSpeak || textToSpeak.trim().length === 0) {
      console.error('No text for current chunk!');
      this.isPlaying = false;
      return;
    }
    
    console.log('🎬 Playing chunk', this.currentChunkIndex + 1, 'of', this.textChunks.length);
    console.log('  - Length:', textToSpeak.length, 'chars');
    
    // Reset boundary event flag
    this.boundaryEventFired = false;
    
    // Create utterance for this chunk
    this.utterance = new SpeechSynthesisUtterance(textToSpeak);
    this.utterance.rate = this.speechRate;
    this.utterance.pitch = 1;
    this.utterance.volume = 1;
    this.utterance.lang = 'en-US';
    
    if (this.selectedVoice) {
      this.utterance.voice = this.selectedVoice;
    }
    
    // Track word highlighting
    let wordCounter = 0;
    const chunkWords = textToSpeak.split(/\s+/).filter(w => w.length > 0);
    const chunkWordOffset = this.chunkWordOffsets[this.currentChunkIndex];
    
    // Event handlers
    this.utterance.onstart = () => {
      console.log('✓ Chunk speech started');
      
      const wordsPerMinute = 200 * this.speechRate;
      const msPerWord = (60 * 1000) / wordsPerMinute;
      
      // Start highlighting
      this.currentWordIndex = chunkWordOffset;
      this.cdr.detectChanges();
      wordCounter = 1;
      
      this.highlightTimer = setInterval(() => {
        if (this.boundaryEventFired) {
          clearInterval(this.highlightTimer);
          return;
        }
        
        this.ngZone.run(() => {
          if (wordCounter < chunkWords.length) {
            this.currentWordIndex = chunkWordOffset + wordCounter;
            wordCounter++;
            this.cdr.detectChanges();
          } else {
            clearInterval(this.highlightTimer);
          }
        });
      }, msPerWord);
    };
    
    this.utterance.onboundary = (event: SpeechSynthesisEvent) => {
      this.boundaryEventFired = true;
      if (event.name === 'word') {
        this.ngZone.run(() => {
          this.currentWordIndex = chunkWordOffset + wordCounter;
          wordCounter++;
          this.cdr.detectChanges();
        });
      }
    };
    
    // onend is already handled in the main play() method
    this.utterance.onend = () => {
      this.ngZone.run(() => {
        if (this.highlightTimer) {
          clearInterval(this.highlightTimer);
          this.highlightTimer = null;
        }
        
        if (this.currentChunkIndex < this.textChunks.length - 1) {
          console.log('Auto-advancing to chunk', this.currentChunkIndex + 2, 'of', this.textChunks.length);
          this.currentChunkIndex++;
          setTimeout(() => {
            this.playCurrentChunk();
          }, 500);
        } else {
          console.log('Reading complete');
          this.isPlaying = false;
          this.isPaused = false;
          this.currentWordIndex = -1;
          this.cdr.detectChanges();
        }
      });
    };
    
    this.utterance.onerror = (event: any) => {
      console.error('Chunk speech error:', event.error);
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer);
        this.highlightTimer = null;
      }
      this.isPlaying = false;
      this.currentWordIndex = -1;
      this.cdr.detectChanges();
      
      if (event.error && event.error !== 'interrupted' && event.error !== 'canceled') {
        alert('Speech error: ' + event.error);
      }
    };
    
    // Speak the chunk
    this.synthesis.speak(this.utterance);
    
    // Fallback for cloud voices
    setTimeout(() => {
      if (this.synthesis.speaking && !this.highlightTimer) {
        console.log('⚠️ onstart did not fire - starting highlight manually');
        const wordsPerMinute = 200 * this.speechRate;
        const msPerWord = (60 * 1000) / wordsPerMinute;
        
        this.currentWordIndex = chunkWordOffset;
        this.cdr.detectChanges();
        wordCounter = 1;
        
        this.highlightTimer = setInterval(() => {
          if (this.boundaryEventFired) {
            clearInterval(this.highlightTimer);
            return;
          }
          
          this.ngZone.run(() => {
            if (wordCounter < chunkWords.length) {
              this.currentWordIndex = chunkWordOffset + wordCounter;
              wordCounter++;
              this.cdr.detectChanges();
            } else {
              clearInterval(this.highlightTimer);
            }
          });
        }, msPerWord);
      }
    }, 100);
  }

  pause() {
    if (this.isPlaying) {
      this.synthesis.pause();
      
      // Pause the highlight timer
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer);
        this.highlightTimer = null;
      }
      
      this.isPaused = true;
      this.isPlaying = false;
    }
  }

  private speakWords() {
    // This method is no longer used but kept for compatibility
  }

  private scrollToCurrentWord() {
    requestAnimationFrame(() => {
      const wordElement = document.getElementById('word-' + this.currentWordIndex);
      if (wordElement && this.textDisplay) {
        const container = this.textDisplay.nativeElement;
        
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const wordRect = wordElement.getBoundingClientRect();
          
          // Check if word is out of view
          if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
            wordElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }
      }
    });
  }

  private scrollToPdfWord() {
    const wordId = 'pdf-word-' + this.currentPageWordIndex;
    const wordElement = document.getElementById(wordId);
    
    if (!wordElement) {
      console.warn('Word element not found:', wordId, 'Total words on page:', this.currentPageWords.length);
      return;
    }
    
    console.log('Found word element:', wordId);
    const container = wordElement.closest('.pdf-text-container');
    
    if (!container) {
      console.warn('Container not found for word:', wordId);
      return;
    }
    
    const containerRect = container.getBoundingClientRect();
    const wordRect = wordElement.getBoundingClientRect();
    
    // Check if word is out of view
    if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
      console.log('Scrolling word into view');
      wordElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private highlightPdfWord(globalWordIndex: number) {
    // Find which page this word is on
    let targetPage = this.currentPage;
    for (const [pageNum, range] of this.pageWordRanges.entries()) {
      if (globalWordIndex >= range.start && globalWordIndex <= range.end) {
        targetPage = pageNum;
        break;
      }
    }
    
    console.log('Highlighting PDF word:', globalWordIndex, 'on page:', targetPage);
    
    // If word is on a different page, switch to that page
    if (targetPage !== this.currentPage) {
      console.log('Switching from page', this.currentPage, 'to page', targetPage);
      this.showPdfPage(targetPage);
    }
    
    // Convert global word index to page-specific index
    const pageRange = this.pageWordRanges.get(this.currentPage);
    if (!pageRange) {
      console.warn('No page range found for page', this.currentPage);
      return;
    }
    
    this.currentPageWordIndex = globalWordIndex - pageRange.start;
    console.log('Page word index:', this.currentPageWordIndex);
    this.cdr.detectChanges();
    
    // Scroll to the highlighted word
    requestAnimationFrame(() => {
      const wordElement = document.getElementById('pdf-word-' + this.currentPageWordIndex);
      if (wordElement) {
        const container = wordElement.closest('.pdf-text-container');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const wordRect = wordElement.getBoundingClientRect();
          
          // Check if word is out of view
          if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
            wordElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }
      }
    });
  }

  stop() {
    this.synthesis.cancel();
    
    // Clean up timer
    if (this.highlightTimer) {
      clearInterval(this.highlightTimer);
      this.highlightTimer = null;
    }
    
    this.isPlaying = false;
    this.isPaused = false;
    this.currentWordIndex = -1;
    this.currentPageWordIndex = -1;
    this.cdr.detectChanges();
  }

  onSpeedChange(event: any) {
    this.speechRate = parseFloat(event.target.value);
    this.updateSpeedDuringPlayback();
  }

  setSpeed(speed: number) {
    this.speechRate = speed;
    this.updateSpeedDuringPlayback();
  }

  private updateSpeedDuringPlayback() {
    // If currently playing, update the speech rate and restart timer with new speed
    if (this.isPlaying && this.utterance) {
      console.log('🔄 Updating speed to:', this.speechRate, 'x');
      
      // Get current position
      const currentWordIdx = this.isPdfFile ? this.currentPageWordIndex : this.currentWordIndex;
      const wordsArray = this.isPdfFile ? this.currentPageWords : this.words;
      const totalWords = wordsArray.length;
      
      if (currentWordIdx >= totalWords) return;
      
      // Cancel current speech and timer
      this.synthesis.cancel();
      
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer);
        this.highlightTimer = null;
      }
      
      // Get remaining text from current word
      const remainingWordsArray = wordsArray.slice(currentWordIdx);
      const remainingText = remainingWordsArray.join(' ');
      
      if (remainingText.trim().length === 0) return;
      
      // Calculate new timing based on speech rate
      // Base: 200 words per minute adjusted by rate
      const wordsPerMinute = 200 * this.speechRate;
      const msPerWord = (60 * 1000) / wordsPerMinute;
      
      console.log('⏱ New timing:', Math.round(msPerWord), 'ms/word for', remainingWordsArray.length, 'remaining words');
      
      // Create new utterance for remaining text
      const newUtterance = new SpeechSynthesisUtterance(remainingText);
      newUtterance.rate = this.speechRate;
      newUtterance.pitch = 1;
      newUtterance.volume = 1;
      newUtterance.lang = 'en-US';
      
      if (this.selectedVoice) {
        newUtterance.voice = this.selectedVoice;
      }
      
      let localWordCounter = 0;
      this.boundaryEventFired = false;
      
      // Event handlers for new utterance
      newUtterance.onstart = () => {
        console.log('✓ Resumed at word', currentWordIdx, 'with speed', this.speechRate);
      };
      
      newUtterance.onboundary = (event: SpeechSynthesisEvent) => {
        this.boundaryEventFired = true;
        if (event.name === 'word') {
          this.ngZone.run(() => {
            const absoluteWordIdx = currentWordIdx + localWordCounter;
            if (this.isPdfFile) {
              this.currentPageWordIndex = absoluteWordIdx;
            } else {
              this.currentWordIndex = absoluteWordIdx;
            }
            localWordCounter++;
            this.cdr.detectChanges();
          });
        }
      };
      
      newUtterance.onend = () => {
        this.ngZone.run(() => {
          if (this.highlightTimer) {
            clearInterval(this.highlightTimer);
            this.highlightTimer = null;
          }
          
          if (this.isPdfFile && this.currentPage < this.totalPages) {
            this.showPdfPage(this.currentPage + 1);
            setTimeout(() => this.play(), 500);
          } else {
            this.isPlaying = false;
            this.isPaused = false;
            this.currentWordIndex = -1;
            this.currentPageWordIndex = -1;
            this.cdr.detectChanges();
          }
        });
      };
      
      newUtterance.onerror = (event: any) => {
        if (this.highlightTimer) {
          clearInterval(this.highlightTimer);
          this.highlightTimer = null;
        }
        if (event.error && event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech error:', event.error);
        }
      };
      
      this.utterance = newUtterance;
      
      // Start timer for highlighting (fallback if boundary events don't fire)
      let timerWordCounter = 0;
      
      this.highlightTimer = setInterval(() => {
        if (this.boundaryEventFired) {
          clearInterval(this.highlightTimer);
          this.highlightTimer = null;
          return;
        }
        
        this.ngZone.run(() => {
          if (timerWordCounter < remainingWordsArray.length) {
            const absoluteWordIdx = currentWordIdx + timerWordCounter;
            if (this.isPdfFile) {
              this.currentPageWordIndex = absoluteWordIdx;
            } else {
              this.currentWordIndex = absoluteWordIdx;
            }
            timerWordCounter++;
            this.cdr.detectChanges();
          } else {
            if (this.highlightTimer) {
              clearInterval(this.highlightTimer);
              this.highlightTimer = null;
            }
          }
        });
      }, msPerWord);
      
      // Start speaking
      this.synthesis.speak(newUtterance);
    }
  }

  compareVoices(v1: SpeechSynthesisVoice | null, v2: SpeechSynthesisVoice | null): boolean {
    return v1?.voiceURI === v2?.voiceURI;
  }

  onVoiceChange(event: any) {
    // selectedVoice is already updated by ngModel
    // This method can be used for additional actions if needed
  }
}
