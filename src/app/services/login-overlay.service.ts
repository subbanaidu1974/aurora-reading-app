import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginOverlayService {
  private openSubject = new Subject<void>();
  private closeSubject = new Subject<void>();
  open$ = this.openSubject.asObservable();
  close$ = this.closeSubject.asObservable();

  open(): void {
    this.openSubject.next();
  }

  close(): void {
    this.closeSubject.next();
  }
}
