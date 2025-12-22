import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <div class="app-body-offset">
      <router-outlet></router-outlet>
    </div>
    
    <!-- Chatbot Panel -->
    <div class="chatbot-panel" [class.open]="isChatbotOpen">
      <div class="chatbot-header">
        <h3>Aurora Assistant</h3>
        <button class="close-btn" (click)="toggleChatbot()">×</button>
      </div>
      <div class="chatbot-messages" #messagesContainer>
        <div *ngFor="let message of messages" [class]="'message ' + message.type">
          <div class="message-bubble">{{ message.text }}</div>
        </div>
      </div>
      <div class="chatbot-input">
        <input 
          type="text" 
          [(ngModel)]="userMessage" 
          (keyup.enter)="sendMessage()"
          placeholder="Type your message..."
        />
        <button (click)="sendMessage()">Send</button>
      </div>
    </div>
    
    <button class="chatbot-button" (click)="toggleChatbot()" title="Chat with us">
      💬
    </button>
  `,
  styles: [`
    .chatbot-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .chatbot-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    
    .chatbot-button:active {
      transform: scale(0.95);
    }
    
    .chatbot-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      transform: translateY(600px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 999;
    }
    
    .chatbot-panel.open {
      transform: translateY(0);
      opacity: 1;
    }
    
    .chatbot-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 10px 10px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chatbot-header h3 {
      margin: 0;
      font-size: 18px;
    }
    
    .close-btn {
      background: transparent;
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 30px;
      height: 30px;
    }
    
    .close-btn:hover {
      opacity: 0.8;
    }
    
    .chatbot-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f5f5f5;
    }
    
    .message {
      margin-bottom: 12px;
      display: flex;
    }
    
    .message.bot {
      justify-content: flex-start;
    }
    
    .message.user {
      justify-content: flex-end;
    }
    
    .message-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 18px;
      word-wrap: break-word;
    }
    
    .message.bot .message-bubble {
      background: #667eea;
      color: white;
      border-bottom-left-radius: 4px;
    }
    
    .message.user .message-bubble {
      background: #e0e0e0;
      color: #333;
      border-bottom-right-radius: 4px;
    }
    
    .chatbot-input {
      display: flex;
      padding: 15px;
      background: white;
      border-radius: 0 0 10px 10px;
      border-top: 1px solid #ddd;
    }
    
    .chatbot-input input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    
    .chatbot-input button {
      margin-left: 10px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .chatbot-input button:hover {
      opacity: 0.9;
    }
  `],
  standalone: false
})
export class AppComponent implements OnInit {
  isChatbotOpen = false;
  userMessage = '';
  messages: { text: string; type: 'user' | 'bot' }[] = [];

  constructor(private router: Router) {
    // Welcome message
    this.messages.push({
      text: 'Hello! I\'m Aurora Assistant. How can I help you today?',
      type: 'bot'
    });
  }

  ngOnInit() {
    // Use sessionStorage to detect fresh page load
    const hasNavigated = sessionStorage.getItem('hasNavigated');
    
    if (!hasNavigated) {
      // First time loading or fresh refresh - go to home
      sessionStorage.setItem('hasNavigated', 'true');
      this.router.navigateByUrl('/home');
    }
    
    // Listen for route changes to keep session alive
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        sessionStorage.setItem('hasNavigated', 'true');
      }
    });
  }

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    // Add user message
    this.messages.push({
      text: this.userMessage,
      type: 'user'
    });

    // Get bot response
    const botResponse = this.getBotResponse(this.userMessage);
    
    // Clear input
    this.userMessage = '';

    // Add bot response after a short delay
    setTimeout(() => {
      this.messages.push({
        text: botResponse,
        type: 'bot'
      });
    }, 500);
  }

  getBotResponse(userMsg: string): string {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi')) {
      return 'Hello! Welcome to Aurora. How can I assist you with your reading and learning today?';
    } else if (msg.includes('help')) {
      return 'I can help you with Study & Organization Tools, Visual & Accessibility Settings, Reading Support, and Writing Assistance. What would you like to know more about?';
    } else if (msg.includes('reading') || msg.includes('tts')) {
      return 'Our Reading Support includes Text-to-Speech, Dyslexia-Friendly Fonts, and Audiobook support. Would you like to know more about any specific feature?';
    } else if (msg.includes('writing')) {
      return 'Our Writing Assistance offers Speech-to-Text, Spell Check, and Word Prediction to help with your essays and assignments.';
    } else if (msg.includes('study') || msg.includes('organization')) {
      return 'We offer Notes, Calendar/Tasks, Mind Mapping, Flashcards, Dictionary, and Text Highlighting features to help you stay organized!';
    } else if (msg.includes('settings') || msg.includes('accessibility')) {
      return 'You can customize font style, size, colors, background themes, line spacing, and even use screen overlays to reduce eye strain.';
    } else if (msg.includes('thank')) {
      return 'You\'re welcome! Feel free to ask if you need anything else.';
    } else {
      return 'I\'m here to help you navigate Aurora\'s features. You can ask me about Reading Support, Writing Assistance, Study Tools, or Accessibility Settings!';
    }
  }
}
