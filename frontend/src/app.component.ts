import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <div class="logo">Smart<span>Med</span></div>
        <div class="nav-links">
        @if (!isAuthed) {
          <a routerLink="/login" routerLinkActive="active">{{ 'nav.login' | translate }}</a>
          <a routerLink="/register" routerLinkActive="active">{{ 'nav.register' | translate }}</a>
        } @else {
          <a routerLink="/symptoms" routerLinkActive="active">{{ 'nav.symptoms' | translate }}</a>
          <a routerLink="/results" routerLinkActive="active">{{ 'nav.results' | translate }}</a>
          <a routerLink="/profile" routerLinkActive="active">{{ 'nav.profile' | translate }}</a>
          <button class="logout-btn" (click)="logout()">{{ 'nav.logout' | translate }}</button>
        }
        <select class="lang-select" [value]="currentLang" (change)="setLanguage($event)">
          <option value="kk">KK</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        </div>
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`
    .navbar {
      background: rgba(255, 255, 255, 0.86);
      border-bottom: 1px solid rgba(225, 240, 234, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-inner {
      width: min(1040px, 100%);
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }
    .logo {
      font-family: Georgia, serif;
      font-size: 22px;
      color: #1D9E75;
      font-weight: bold;
    }
    .logo span { color: #1a2e25; }
    .nav-links { display: flex; gap: 4px; align-items: center; }
    .nav-links a {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      color: #6b7f75;
      transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      background: #E1F5EE;
      color: #085041;
    }
    .logout-btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      border: none;
      background: transparent;
      color: #6b7f75;
      cursor: pointer;
    }
    .logout-btn:hover {
      background: #fcebeb;
      color: #a32d2d;
    }
    .lang-select {
      border: 1px solid rgba(225, 240, 234, 0.95);
      border-radius: 8px;
      padding: 6px 8px;
      color: #1a2e25;
      background: rgba(255,255,255,0.75);
      font-size: 13px;
    }
  `]
})
export class AppComponent {
  isAuthed = false;

  constructor(private authService: AuthService, private languageService: LanguageService) {
    this.isAuthed = this.authService.isAuthenticated();
    this.authService.authChanges().subscribe((authed) => {
      this.isAuthed = authed;
      if (authed) {
        this.authService.refreshProfileFromApi();
      }
    });
  }

  get currentLang(): string {
    return this.languageService.currentLang;
  }

  setLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.languageService.setLanguage(target.value);
  }

  logout(): void {
    this.authService.logout();
  }
}
