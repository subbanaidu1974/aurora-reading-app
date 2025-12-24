import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { AppComponent } from './app.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AuroraLandingComponent } from './aurora-landing/aurora-landing.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { TasksTabComponent } from './tasks/tasks-tab/tasks-tab.component';
// StudyOrganizationToolsComponent is now a standalone component
import { NotesComponent } from './tools/study-organization-tools/notes/notes.component';
import { CalendarTasksComponent } from './tools/study-organization-tools/calendar-tasks/calendar-tasks.component';
import { MindMappingComponent } from './tools/study-organization-tools/mind-mapping/mind-mapping.component';
import { FlashcardsComponent } from './tools/study-organization-tools/flashcards/flashcards.component';
import { DictionaryComponent } from './tools/study-organization-tools/dictionary/dictionary.component';
import { TextHighlightingComponent } from './tools/study-organization-tools/text-highlighting/text-highlighting.component';
import { CustomizableDisplayComponent } from './tools/visual-accessibility-settings/customizable-display/customizable-display.component';
import { ScreenOverlayComponent } from './tools/visual-accessibility-settings/screen-overlay/screen-overlay.component';
import { ImmersiveReaderComponent } from './tools/visual-accessibility-settings/immersive-reader/immersive-reader.component';
import { ReadingSupportComponent } from './tools/reading-support/reading-support.component';
import { TextToSpeechComponent } from './tools/reading-support/text-to-speech/text-to-speech.component';
import { SpeechToTextComponent } from './tools/reading-support/speech-to-text/speech-to-text.component';
// TextToSpeechComponent and SpeechToTextComponent are standalone components
import { DyslexiaFontsComponent } from './tools/reading-support/dyslexia-fonts/dyslexia-fonts.component';
import { AudiobookSupportComponent } from './tools/reading-support/audiobook-support/audiobook-support.component';
import { WritingAssistanceComponent } from './tools/writing-assistance/writing-assistance.component';
import { Tool5Component } from './tools/tool5/tool5.component';
import { SignupComponent } from './signup/signup.component';
import { SettingsComponent } from './settings/settings.component';
import { VisualAccessibilitySettingsComponent } from './tools/visual-accessibility-settings/visual-accessibility-settings.component';
import { StudyOrganizationToolsComponent } from './tools/study-organization-tools/study-organization-tools.component';
// Flashcards standalone components (moved into tools)
import { DeckListComponent } from './tools/study-organization-tools/flashcards/components/deck-list/deck-list.component';
import { FlashcardCreateComponent } from './tools/study-organization-tools/flashcards/components/flashcard-create/flashcard-create.component';
import { FlashcardStudyComponent } from './tools/study-organization-tools/flashcards/components/flashcard-study/flashcard-study.component';
import { CategorySelectorComponent } from './tools/study-organization-tools/flashcards/components/category-selector/category-selector.component';
import { FocusModeComponent } from './tools/study-organization-tools/flashcards/components/focus-mode/focus-mode.component';


@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    AuroraLandingComponent,
    AboutComponent,
    LoginComponent,
    TasksTabComponent,
    CalendarTasksComponent,
    DictionaryComponent,
    TextHighlightingComponent,
    CustomizableDisplayComponent,
    ScreenOverlayComponent,
    ImmersiveReaderComponent,
    AudiobookSupportComponent,
    WritingAssistanceComponent,
    Tool5Component,
    SignupComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSliderModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatMenuModule,
    FlashcardsComponent,
    DeckListComponent,
    FlashcardCreateComponent,
    FlashcardStudyComponent,
    CategorySelectorComponent,
    FocusModeComponent,
    UserProfileCardComponent,
    StudyOrganizationToolsComponent,
    NotesComponent,
    TextToSpeechComponent,
    SpeechToTextComponent,
    ReadingSupportComponent,
    DyslexiaFontsComponent,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AuroraLandingComponent },
      { path: 'about', component: AboutComponent },
      { path: 'signup', component: SignupComponent },
      { 
        path: 'tasks', 
        component: TasksTabComponent,
        children: [
          { path: '', redirectTo: 'study-organization-tools/notes', pathMatch: 'full' },
          { 
            path: 'study-organization-tools', 
            component: StudyOrganizationToolsComponent,
            children: [
              { path: '', redirectTo: 'notes', pathMatch: 'full' },
              { path: 'notes', component: NotesComponent },
              { path: 'calendar-tasks', component: CalendarTasksComponent },
              { path: 'mind-mapping', component: MindMappingComponent },
              { path: 'flashcards', component: FlashcardsComponent,
                children: [
                  { path: '', redirectTo: 'decks', pathMatch: 'full' },
                  { path: 'decks', component: DeckListComponent },
                  { path: 'create', component: FlashcardCreateComponent },
                  { path: 'study', component: FlashcardStudyComponent }
                ]
              },
              { path: 'dictionary', component: DictionaryComponent },
              { path: 'text-highlighting', component: TextHighlightingComponent }
            ]
          },
          { 
            path: 'visual-accessibility-settings', 
            component: VisualAccessibilitySettingsComponent,
            children: [
              { path: '', redirectTo: 'customizable-display', pathMatch: 'full' },
              { path: 'customizable-display', component: CustomizableDisplayComponent },
              { path: 'screen-overlay', component: ScreenOverlayComponent },
              { path: 'immersive-reader', component: ImmersiveReaderComponent }
            ]
          },
          { 
            path: 'reading-support', 
            component: ReadingSupportComponent,
            children: [
              { path: '', redirectTo: 'text-to-speech', pathMatch: 'full' },
              { path: 'text-to-speech', component: TextToSpeechComponent },
              { path: 'speech-to-text', component: SpeechToTextComponent },
              { path: 'dyslexia-fonts', component: DyslexiaFontsComponent },
              { path: 'audiobook-support', component: AudiobookSupportComponent }
            ]
          },
          { path: 'writing-assistance', component: WritingAssistanceComponent },
          { path: 'tool5', component: Tool5Component }
        ]
      },
      { path: 'login', component: LoginComponent },
      { path: '**', redirectTo: 'home' }
    ], { useHash: true })
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
