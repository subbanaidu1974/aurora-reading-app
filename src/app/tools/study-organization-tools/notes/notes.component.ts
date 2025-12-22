import { Component } from '@angular/core';

interface Note {
  id: number;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  audioUrl?: string;
  images: string[];
  lastModified: Date;
}

interface Folder {
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-notes',
  standalone: false,
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent {
  notes: Note[] = [
    {
      id: 1,
      title: 'Welcome to Notes',
      content: 'This is your first note. You can add text, audio recordings, and images.',
      folder: 'All Notes',
      tags: ['welcome'],
      images: [],
      lastModified: new Date()
    }
  ];

  folders: Folder[] = [
    { name: 'All Notes', icon: '📝', count: 1 },
    { name: 'Work', icon: '💼', count: 0 },
    { name: 'Personal', icon: '🏠', count: 0 },
    { name: 'Study', icon: '📚', count: 0 }
  ];

  selectedFolder = 'All Notes';
  selectedNote: Note | null = null;
  isCreatingNote = false;
  searchQuery = '';
  
  // Audio recording
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  selectFolder(folderName: string) {
    this.selectedFolder = folderName;
    this.selectedNote = null;
    this.isCreatingNote = false;
  }

  getFilteredNotes(): Note[] {
    let filtered = this.notes;
    
    if (this.selectedFolder !== 'All Notes') {
      filtered = filtered.filter(note => note.folder === this.selectedFolder);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  selectNote(note: Note) {
    this.selectedNote = note;
    this.isCreatingNote = false;
  }

  createNewNote() {
    const newNote: Note = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      folder: this.selectedFolder === 'All Notes' ? 'Personal' : this.selectedFolder,
      tags: [],
      images: [],
      lastModified: new Date()
    };
    this.notes.push(newNote);
    this.selectedNote = newNote;
    this.isCreatingNote = true;
    this.updateFolderCounts();
  }

  deleteNote(note: Note, event: Event) {
    event.stopPropagation();
    if (confirm(`Delete "${note.title}"?`)) {
      this.notes = this.notes.filter(n => n.id !== note.id);
      if (this.selectedNote?.id === note.id) {
        this.selectedNote = null;
      }
      this.updateFolderCounts();
    }
  }

  updateNote() {
    if (this.selectedNote) {
      this.selectedNote.lastModified = new Date();
    }
  }

  moveNoteToFolder(folder: string) {
    if (this.selectedNote) {
      this.selectedNote.folder = folder;
      this.updateFolderCounts();
    }
  }

  addTag(tag: string) {
    if (this.selectedNote && tag.trim() && !this.selectedNote.tags.includes(tag.trim())) {
      this.selectedNote.tags.push(tag.trim());
    }
  }

  removeTag(tag: string) {
    if (this.selectedNote) {
      this.selectedNote.tags = this.selectedNote.tags.filter(t => t !== tag);
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (this.selectedNote) {
          this.selectedNote.audioUrl = audioUrl;
          this.updateNote();
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
    }
  }

  removeAudio() {
    if (this.selectedNote && confirm('Remove audio recording?')) {
      if (this.selectedNote.audioUrl) {
        URL.revokeObjectURL(this.selectedNote.audioUrl);
      }
      this.selectedNote.audioUrl = undefined;
      this.updateNote();
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && this.selectedNote) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (this.selectedNote && e.target?.result) {
            this.selectedNote.images.push(e.target.result as string);
            this.updateNote();
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    if (this.selectedNote && confirm('Remove this image?')) {
      this.selectedNote.images.splice(index, 1);
      this.updateNote();
    }
  }

  updateFolderCounts() {
    this.folders.forEach(folder => {
      if (folder.name === 'All Notes') {
        folder.count = this.notes.length;
      } else {
        folder.count = this.notes.filter(note => note.folder === folder.name).length;
      }
    });
  }

  getPreviewText(content: string): string {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}
