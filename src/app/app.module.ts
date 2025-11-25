import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AuroraLandingComponent } from './aurora-landing/aurora-landing.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { TasksTabComponent } from './tasks/tasks-tab/tasks-tab.component';
import { Task1Component } from './tasks/task1/task1.component';
import { Task2Component } from './tasks/task2/task2.component';
import { Task3Component } from './tasks/task3/task3.component';
import { Task4Component } from './tasks/task4/task4.component';
import { Task5Component } from './tasks/task5/task5.component';
import { Tool1Component } from './tools/tool1/tool1.component';
import { Tool2Component } from './tools/tool2/tool2.component';
import { Tool3Component } from './tools/tool3/tool3.component';
import { Tool4Component } from './tools/tool4/tool4.component';
import { Tool5Component } from './tools/tool5/tool5.component';
import { SignupComponent } from './signup/signup.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    AuroraLandingComponent,
    AboutComponent,
    LoginComponent,
    TasksTabComponent,
    Task1Component,
    Task2Component,
    Task3Component,
    Task4Component,
    Task5Component,
    Tool1Component,
    Tool2Component,
    Tool3Component,
    Tool4Component,
    Tool5Component,
    SignupComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AuroraLandingComponent },
      { path: 'about', component: AboutComponent },
      { path: 'signup', component: SignupComponent },
      { 
        path: 'tasks', 
        component: TasksTabComponent,
        children: [
          { path: '', redirectTo: 'task1', pathMatch: 'full' },
          { path: 'task1', component: Task1Component },
          { path: 'task2', component: Task2Component },
          { path: 'task3', component: Task3Component },
          { path: 'task4', component: Task4Component },
          { path: 'task5', component: Task5Component },
          { path: 'tool1', component: Tool1Component },
          { path: 'tool2', component: Tool2Component },
          { path: 'tool3', component: Tool3Component },
          { path: 'tool4', component: Tool4Component },
          { path: 'tool5', component: Tool5Component }
        ]
      },
      { path: 'login', component: LoginComponent },
      { path: '**', redirectTo: 'home' }
    ], { useHash: false })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
