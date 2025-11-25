import { Component } from '@angular/core';
import { AuthService, AuthUser } from '../../services/auth.service';

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
  
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private auth: AuthService) {}

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
