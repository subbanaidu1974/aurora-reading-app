import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthUser {
  name: string;
  initials: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();
  readonly user$: Observable<AuthUser | null> = this.userSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem('auroraLoggedIn');
    if (stored === 'true') {
      this.loggedInSubject.next(true);
      const name = localStorage.getItem('auroraUserName');
      if (name) {
        this.userSubject.next({ name, initials: this.computeInitials(name) });
      }
    }
  }

  login(name: string = 'Admin User'): void {
    const initials = this.computeInitials(name);
    this.loggedInSubject.next(true);
    this.userSubject.next({ name, initials });
    localStorage.setItem('auroraLoggedIn', 'true');
    localStorage.setItem('auroraUserName', name);
  }

  logout(): void {
    this.loggedInSubject.next(false);
    this.userSubject.next(null);
    localStorage.removeItem('auroraLoggedIn');
    localStorage.removeItem('auroraUserName');
  }

  private computeInitials(name: string): string {
    const parts = name.split(/\s+/).filter(p => p.length);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].substring(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
