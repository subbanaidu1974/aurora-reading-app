import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<app-header></app-header><div class="app-body-offset"><router-outlet></router-outlet></div>',
  standalone: false
})
export class AppComponent {}
