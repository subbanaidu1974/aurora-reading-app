import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoginOverlayService } from '../services/login-overlay.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;

  // Dummy credentials
  private readonly dummyEmail = 'admin';
  private readonly dummyPassword = 'admin';

  constructor(private auth: AuthService, private overlay: LoginOverlayService, private router: Router) {}

  submit(event: Event) {
    event.preventDefault();
    this.error = null;
    if (this.email === this.dummyEmail && this.password === this.dummyPassword) {
      this.auth.login('Admin User');
      this.overlay.close();
      // Navigate to tasks page after successful dummy validation
      this.router.navigate(['/tasks']);
    } else {
      this.error = 'Invalid username or password (use admin / admin)';
    }
  }
}
