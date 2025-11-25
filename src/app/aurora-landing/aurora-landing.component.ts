import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginOverlayService } from '../services/login-overlay.service';

@Component({
  selector: 'app-aurora-landing',
  templateUrl: './aurora-landing.component.html',
  styleUrls: ['./aurora-landing.component.css'],
  standalone: false
})
export class AuroraLandingComponent implements OnInit, OnDestroy {
  showLogin = false;
  private sub?: Subscription;

  constructor(private loginService: LoginOverlayService) {}

  ngOnInit(): void {
    this.sub = new Subscription();
    this.sub.add(this.loginService.open$.subscribe(() => this.showLogin = true));
    this.sub.add(this.loginService.close$.subscribe(() => this.showLogin = false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  openLogin(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
  }
}

