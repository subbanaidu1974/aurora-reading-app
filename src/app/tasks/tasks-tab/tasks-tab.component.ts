
import { Component } from '@angular/core';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Task {
  id: number;
  title: string;
  description: string;
  date: Date;
  time?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  reminder?: number;
}

interface CalendarDay {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
  date: Date;
}

@Component({
  selector: 'app-tasks-tab',
  templateUrl: './tasks-tab.component.html',
  styleUrls: ['./tasks-tab.component.css'],
  standalone: false
})
export class TasksTabComponent {
  currentDate = new Date();
  currentMonth = '';
  currentYear = 0;
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;
  userName: string = '';
  userInitials: string = '';
  studyToolsExpanded: boolean = false;
  visualAccessibilityExpanded: boolean = false;
  readingSupportExpanded: boolean = false;
  flashcardsExpanded: boolean = false;
  quizEngineExpanded: boolean = false;
  
  // Task section expansion states
  overdueExpanded: boolean = true;
  todayExpanded: boolean = true;
  thisWeekExpanded: boolean = true;
  laterExpanded: boolean = false;
  
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

  // Dynamic sidebar menu model
  sidebarCollapsed = false;

  menuItems: any[] = [
    {
      id: 'study',
      label: 'Study & Organization Tools',
      icon: '📚',
      expanded: false,
      children: [
        { id: 'notes', label: 'Notes', icon: '🗂️', route: 'study-organization-tools/notes' },
        { id: 'calendar-tasks', label: 'Calendar & Tasks', icon: '📅', route: 'study-organization-tools/calendar-tasks' },
        { id: 'mind-mapping', label: 'Mind Mapping', icon: '🗺️', route: 'study-organization-tools/mind-mapping' },
        { id: 'flashcards', label: 'Flashcards', icon: '🃏', expanded: false, children: [
          { id: 'quiz-mcq', label: 'MCQ Quiz', icon: '🔘', route: 'study-organization-tools/flashcards/quiz-engine/mcq' },
          { id: 'quiz-survey', label: 'SurveyJS', icon: '📋', route: 'study-organization-tools/flashcards/quiz-engine/surveyjs' }
        ]},
        { id: 'dictionary', label: 'Dictionary', icon: '🔍', route: 'study-organization-tools/dictionary' },
        { id: 'text-highlighting', label: 'Text Highlighting', icon: '✏️', route: 'study-organization-tools/text-highlighting' }
      ]
    },
    {
      id: 'visual',
      label: 'Visual & Accessibility Settings',
      icon: '🛠️',
      expanded: false,
      children: [
        { id: 'customizable-display', label: 'Customizable Display', icon: '🎛️', route: 'visual-accessibility-settings/customizable-display' },
        { id: 'screen-overlay', label: 'Screen Overlay', icon: '🖼️', route: 'visual-accessibility-settings/screen-overlay' },
        { id: 'immersive-reader', label: 'Immersive Reader', icon: '📄', route: 'visual-accessibility-settings/immersive-reader' }
      ]
    },
    {
      id: 'reading',
      label: 'Reading support',
      icon: '📖',
      expanded: false,
      children: [
        { id: 'text-to-speech', label: 'Text-to-Speech', icon: '🔊', route: 'reading-support/text-to-speech' },
        { id: 'speech-to-text', label: 'Speech-to-Text', icon: '🎤', route: 'reading-support/speech-to-text' },
        { id: 'dyslexia-fonts', label: 'Dyslexia Fonts', icon: '🔡', route: 'reading-support/dyslexia-fonts' },
        { id: 'audiobook-support', label: 'Audiobook Support', icon: '🎧', route: 'reading-support/audiobook-support' }
      ]
    },
    { id: 'writing', label: 'Writing Assistance', icon: '✍️', route: 'writing-assistance' }
  ];

  trackById(index: number, item: any) { return item.id; }

  toggleGroup(id: string) {
    const found = this.findItem(id, this.menuItems);
    if (found) found.expanded = !found.expanded;
  }

  isGroupActive(group: any): boolean {
    // mark active if current router url contains any child's route
    if (!group || !group.children) return this.router.url.includes(group?.route || '');
    return group.children.some((c: any) => this.router.url.includes(c.route));
  }

  minimizeSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  addMenuItem(parentId: string | null, item: any) {
    if (!parentId) {
      this.menuItems.push(item);
      return;
    }
    const parent = this.findItem(parentId, this.menuItems);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(item);
    }
  }

  removeMenuItem(id: string) {
    const removeRec = (arr: any[]): boolean => {
      const idx = arr.findIndex(i => i.id === id);
      if (idx !== -1) { arr.splice(idx, 1); return true; }
      for (const i of arr) {
        if (i.children && removeRec(i.children)) return true;
      }
      return false;
    };
    removeRec(this.menuItems);
  }

  private findItem(id: string, list: any[]): any | null {
    for (const item of list) {
      if (item.id === id) return item;
      if (item.children) {
        const res = this.findItem(id, item.children);
        if (res) return res;
      }
    }
    return null;
  }

  tasks: Task[] = [
    // Past tasks in December
    {
      id: 1,
      title: 'History Essay',
      description: 'Write 5-page essay on World War II',
      date: new Date(2025, 11, 5),
      time: '16:00',
      completed: true,
      priority: 'high',
      category: 'History',
      reminder: 60
    },
    {
      id: 2,
      title: 'Chemistry Lab Report',
      description: 'Submit lab experiment findings',
      date: new Date(2025, 11, 10),
      time: '11:00',
      completed: true,
      priority: 'medium',
      category: 'Chemistry',
      reminder: 30
    },
    {
      id: 3,
      title: 'Book Club Meeting',
      description: 'Discuss "To Kill a Mockingbird"',
      date: new Date(2025, 11, 15),
      time: '18:30',
      completed: true,
      priority: 'low',
      category: 'Personal',
      reminder: 15
    },
    // Current/Near-future tasks
    {
      id: 4,
      title: 'Math Assignment',
      description: 'Complete Chapter 12 exercises on calculus',
      date: new Date(2025, 11, 20),
      time: '14:00',
      completed: false,
      priority: 'high',
      category: 'Mathematics',
      reminder: 30
    },
    {
      id: 5,
      title: 'Physics Project Presentation',
      description: 'Present research on renewable energy',
      date: new Date(2025, 11, 21),
      time: '10:00',
      completed: false,
      priority: 'high',
      category: 'Physics',
      reminder: 60
    },
    {
      id: 6,
      title: 'English Literature Quiz',
      description: 'Quiz on Shakespeare sonnets',
      date: new Date(2025, 11, 22),
      time: '13:30',
      completed: false,
      priority: 'medium',
      category: 'English',
      reminder: 45
    },
    {
      id: 7,
      title: 'Study Group Session',
      description: 'Biology exam prep with classmates',
      date: new Date(2025, 11, 23),
      time: '15:00',
      completed: false,
      priority: 'medium',
      category: 'Biology',
      reminder: 30
    },
    // Future tasks
    {
      id: 8,
      title: 'Computer Science Project Due',
      description: 'Submit Python programming assignment',
      date: new Date(2025, 11, 26),
      time: '23:59',
      completed: false,
      priority: 'high',
      category: 'Computer Science',
      reminder: 120
    },
    {
      id: 9,
      title: 'Art Portfolio Review',
      description: 'Prepare artwork for semester evaluation',
      date: new Date(2025, 11, 27),
      time: '09:00',
      completed: false,
      priority: 'medium',
      category: 'Art',
      reminder: 60
    },
    {
      id: 10,
      title: 'Spanish Oral Exam',
      description: 'Conversational Spanish assessment',
      date: new Date(2025, 11, 28),
      time: '11:00',
      completed: false,
      priority: 'high',
      category: 'Spanish',
      reminder: 90
    },
    {
      id: 11,
      title: 'Final Semester Review',
      description: 'Review all subjects for final exams',
      date: new Date(2025, 11, 30),
      time: '14:00',
      completed: false,
      priority: 'high',
      category: 'General',
      reminder: 120
    },
    {
      id: 12,
      title: 'Gym Session',
      description: 'Evening workout and cardio',
      date: new Date(2025, 11, 24),
      time: '17:00',
      completed: false,
      priority: 'low',
      category: 'Personal',
      reminder: 15
    }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.generateCalendar();
    this.auth.user$.subscribe((user: AuthUser | null) => {
      if (user) {
        this.userName = user.name;
        this.userInitials = user.initials;
      } else {
        this.userName = '';
        this.userInitials = '';
      }
    });
    
    // Menus remain collapsed by default; user toggles explicitly.
  }

  toggleStudyTools() {
    this.studyToolsExpanded = !this.studyToolsExpanded;
  }

  isStudyToolsActive(): boolean {
    return this.router.url.includes('/study-organization-tools');
  }

  toggleVisualAccessibility() {
    this.visualAccessibilityExpanded = !this.visualAccessibilityExpanded;
  }

  isVisualAccessibilityActive(): boolean {
    return this.router.url.includes('/visual-accessibility-settings');
  }

  toggleReadingSupport() {
    this.readingSupportExpanded = !this.readingSupportExpanded;
  }

  toggleFlashcards() {
    this.flashcardsExpanded = !this.flashcardsExpanded;
  }

  toggleQuizEngine() {
    this.quizEngineExpanded = !this.quizEngineExpanded;
  }

  isReadingSupportActive(): boolean {
    return this.router.url.includes('/reading-support');
  }

  getOverdueTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today && !task.completed;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getTodaysTasks(): Task[] {
    const today = new Date();
    return this.tasks.filter(task => {
      return this.isSameDay(task.date, today) && !task.completed;
    });
  }

  getThisWeekTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > today && taskDate <= nextWeek && !task.completed;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getLaterTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > nextWeek && !task.completed;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  toggleOverdueSection(): void {
    this.overdueExpanded = !this.overdueExpanded;
  }

  toggleTodaySection(): void {
    this.todayExpanded = !this.todayExpanded;
  }

  toggleThisWeekSection(): void {
    this.thisWeekExpanded = !this.thisWeekExpanded;
  }

  toggleLaterSection(): void {
    this.laterExpanded = !this.laterExpanded;
  }

  getUpcomingTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today && !task.completed;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getDaysOverdue(taskDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const task = new Date(taskDate);
    task.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - task.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  formatTaskDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const taskDate = new Date(date);
    
    if (this.isSameDay(taskDate, today)) {
      return 'Today';
    } else if (this.isSameDay(taskDate, tomorrow)) {
      return 'Tomorrow';
    } else {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return taskDate.toLocaleDateString('en-US', options);
    }
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  toggleTaskComplete(task: Task): void {
    task.completed = !task.completed;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#34c759';
      default: return '#999';
    }
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.currentMonth = this.monthNames[month];
    this.currentYear = year;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.calendarDays = [];
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      this.calendarDays.push({
        day: prevMonthDay.getDate(),
        isToday: false,
        isSelected: false,
        isOtherMonth: true,
        date: prevMonthDay
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= totalDays; day++) {
      const currentDay = new Date(year, month, day);
      currentDay.setHours(0, 0, 0, 0);
      
      this.calendarDays.push({
        day: day,
        isToday: currentDay.getTime() === today.getTime(),
        isSelected: this.selectedDate ? currentDay.getTime() === this.selectedDate.getTime() : false,
        isOtherMonth: false,
        date: currentDay
      });
    }
    
    // Fill remaining cells with next month days
    const remainingCells = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      this.calendarDays.push({
        day: i,
        isToday: false,
        isSelected: false,
        isOtherMonth: true,
        date: nextMonthDay
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDay(day: CalendarDay) {
    if (day.day) {
      this.selectedDate = day.date;
      this.generateCalendar();
      console.log('Selected date:', day.date.toDateString());
    }
  }

}
