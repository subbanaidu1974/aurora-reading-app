import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoginOverlayService } from '../services/login-overlay.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
  standalone: false
})
export class AppHeaderComponent implements OnInit {
  isLoggedIn = false;
  onHome = false;
  onSignup = false;

  constructor(private router: Router, private loginService: LoginOverlayService, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
    // Determine if on home route; update on navigation
    this.onHome = this.isHomeUrl(this.router.url);
    this.onSignup = this.isSignupUrl(this.router.url);
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.onHome = this.isHomeUrl(evt.urlAfterRedirects);
        this.onSignup = this.isSignupUrl(evt.urlAfterRedirects);
      }
    });
  }

  openLogin(): void {
    // If not on home route, navigate then trigger overlay
    if (this.router.url !== '/' && this.router.url !== '/home') {
      this.router.navigate(['/']).then(() => {
        // slight async to ensure component instantiated
        setTimeout(() => this.loginService.open(), 0);
      });
    } else {
      this.loginService.open();
    }
  }

  private isHomeUrl(url: string): boolean {
    return url === '/' || url.startsWith('/home');
  }

  private isSignupUrl(url: string): boolean {
    return url.startsWith('/signup');
  }

}
