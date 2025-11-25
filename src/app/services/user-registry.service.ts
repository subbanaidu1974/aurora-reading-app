import { Injectable } from '@angular/core';

export interface RegisteredUser {
  username: string;
  password: string; // In a real app never store plain text
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string; // ISO string
  newsletter?: boolean;
  aboutMe?: string;
  createdAt: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class UserRegistryService {
  private storageKey = 'auroraUsers';

  private read(): RegisteredUser[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try { return JSON.parse(raw) as RegisteredUser[]; } catch { return []; }
  }

  private write(users: RegisteredUser[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  getUsers(): RegisteredUser[] { return this.read(); }

  isUsernameTaken(username: string): boolean {
    const u = username.trim().toLowerCase();
    return this.read().some(user => user.username.toLowerCase() === u);
  }

  addUser(user: RegisteredUser): string {
    const users = this.read();
    users.push(user);
    this.write(users);
    return this.generateCsv(users);
  }

  generateCsv(users: RegisteredUser[] = this.read()): string {
    const headers = [
      'username','email','firstName','lastName','phone','city','country','dateOfBirth','newsletter','aboutMe','createdAt'
    ];
    const lines = users.map(u => headers.map(h => {
      const v: any = (u as any)[h];
      if (v === undefined || v === null) return '';
      const s = String(v).replace(/"/g,'""');
      return `"${s}` + `"`;
    }).join(','));
    return headers.join(',') + '\n' + lines.join('\n');
  }
}
