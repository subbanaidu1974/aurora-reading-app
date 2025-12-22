import { Component, OnInit } from '@angular/core';

interface Task {
  id: number;
  title: string;
  description: string;
  date: Date;
  time?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  reminder?: number; // minutes before
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
}

interface WeekView {
  date: Date;
  tasks: Task[];
}

@Component({
  selector: 'app-calendar-tasks',
  standalone: false,
  templateUrl: './calendar-tasks.component.html',
  styleUrls: ['./calendar-tasks.component.css']
})
export class CalendarTasksComponent implements OnInit {
  currentDate = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  
  viewMode: 'month' | 'week' | 'agenda' = 'month';
  
  tasks: Task[] = [
    // Past tasks in December
    {
      id: 1,
      title: 'History Essay',
      description: 'Write 5-page essay on World War II',
      date: new Date(2025, 11, 5), // Dec 5
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
      date: new Date(2025, 11, 10), // Dec 10
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
      date: new Date(2025, 11, 15), // Dec 15
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
      date: new Date(2025, 11, 20), // Dec 20 (today)
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
      date: new Date(2025, 11, 21), // Dec 21
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
      date: new Date(2025, 11, 22), // Dec 22
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
      date: new Date(2025, 11, 23), // Dec 23
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
      date: new Date(2025, 11, 26), // Dec 26
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
      date: new Date(2025, 11, 27), // Dec 27
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
      date: new Date(2025, 11, 28), // Dec 28
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
      date: new Date(2025, 11, 30), // Dec 30
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
      date: new Date(2025, 11, 24), // Dec 24
      time: '17:00',
      completed: false,
      priority: 'low',
      category: 'Personal',
      reminder: 15
    }
  ];

  selectedTask: Task | null = null;
  isCreatingTask = false;
  newTask: Partial<Task> = {};

  // Week view
  weekDays: WeekView[] = [];
  weekStart: Date = new Date();

  // Agenda view
  upcomingTasks: Task[] = [];

  ngOnInit() {
    this.generateCalendar();
    this.generateWeekView();
    this.generateAgendaView();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevMonthLastDay.getDate();
    
    this.calendarDays = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }
    
    // Next month days
    const remainingCells = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      isSelected: this.selectedDate ? this.isSameDay(date, this.selectedDate) : false,
      tasks: this.getTasksForDate(date)
    };
  }

  generateWeekView() {
    const startOfWeek = this.getStartOfWeek(this.weekStart);
    this.weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        date,
        tasks: this.getTasksForDate(date)
      });
    }
  }

  generateAgendaView() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.upcomingTasks = this.tasks
      .filter(task => task.date >= today && !task.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getTasksForDate(date: Date): Task[] {
    return this.tasks.filter(task => this.isSameDay(task.date, date));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  selectDate(day: CalendarDay) {
    if (day.isCurrentMonth) {
      this.selectedDate = day.date;
      this.generateCalendar();
      this.selectedTask = null;
    }
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  previousWeek() {
    this.weekStart = new Date(this.weekStart.setDate(this.weekStart.getDate() - 7));
    this.generateWeekView();
  }

  nextWeek() {
    this.weekStart = new Date(this.weekStart.setDate(this.weekStart.getDate() + 7));
    this.generateWeekView();
  }

  switchView(mode: 'month' | 'week' | 'agenda') {
    this.viewMode = mode;
    this.selectedTask = null;
    if (mode === 'week') {
      this.generateWeekView();
    } else if (mode === 'agenda') {
      this.generateAgendaView();
    }
  }

  selectTask(task: Task) {
    this.selectedTask = task;
    this.isCreatingTask = false;
  }

  selectTaskAndStop(task: Task, event: Event) {
    event.stopPropagation();
    this.selectTask(task);
  }

  closeTaskDetail() {
    this.selectedTask = null;
  }

  createNewTask() {
    this.isCreatingTask = true;
    this.selectedTask = null;
    this.newTask = {
      date: this.selectedDate || new Date(),
      priority: 'medium',
      completed: false,
      category: 'General'
    };
  }

  saveNewTask() {
    if (this.newTask.title && this.newTask.date) {
      const task: Task = {
        id: Date.now(),
        title: this.newTask.title,
        description: this.newTask.description || '',
        date: new Date(this.newTask.date),
        time: this.newTask.time,
        completed: false,
        priority: this.newTask.priority || 'medium',
        category: this.newTask.category || 'General',
        reminder: this.newTask.reminder
      };
      
      this.tasks.push(task);
      this.isCreatingTask = false;
      this.newTask = {};
      this.generateCalendar();
      this.generateWeekView();
      this.generateAgendaView();
    }
  }

  cancelNewTask() {
    this.isCreatingTask = false;
    this.newTask = {};
  }

  updateTask() {
    if (this.selectedTask) {
      this.generateCalendar();
      this.generateWeekView();
      this.generateAgendaView();
    }
  }

  toggleTaskComplete(task: Task) {
    task.completed = !task.completed;
    this.generateAgendaView();
  }

  toggleTaskCompleteAndStopPropagation(task: Task, event: Event) {
    event.stopPropagation();
    this.toggleTaskComplete(task);
  }

  deleteTask(task: Task) {
    if (confirm(`Delete task "${task.title}"?`)) {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
      if (this.selectedTask?.id === task.id) {
        this.selectedTask = null;
      }
      this.generateCalendar();
      this.generateWeekView();
      this.generateAgendaView();
    }
  }

  getMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  hasIncompleteTasks(): boolean {
    return this.tasks.some(t => !t.completed);
  }

  hasAnyTasks(): boolean {
    return this.tasks.length > 0;
  }

  isOverdue(task: Task): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today && !task.completed;
  }

  isToday(task: Task): boolean {
    return this.isSameDay(task.date, new Date()) && !task.completed;
  }

  isUpcoming(task: Task): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > today && taskDate <= nextWeek && !task.completed;
  }

  isFuture(task: Task): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate > nextWeek && !task.completed;
  }

  getWeekRange(): string {
    const start = this.weekDays[0]?.date;
    const end = this.weekDays[6]?.date;
    if (!start || !end) return '';
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(time?: string): string {
    if (!time) return '';
    return time;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#ff3b30';
      case 'medium': return '#ff9500';
      case 'low': return '#34c759';
      default: return '#007aff';
    }
  }

  getTasksForDay(): Task[] {
    if (!this.selectedDate) return [];
    return this.getTasksForDate(this.selectedDate);
  }

  updateTaskDate(dateString: string) {
    if (this.selectedTask) {
      this.selectedTask.date = new Date(dateString);
      this.updateTask();
    }
  }

  getTaskDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getOverdueTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getUpcomingTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > today && taskDate <= nextWeek;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getTodaysTasks(): Task[] {
    const today = new Date();
    return this.tasks.filter(task => {
      return this.isSameDay(task.date, today);
    });
  }

  getAllUpcomingTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > today;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
