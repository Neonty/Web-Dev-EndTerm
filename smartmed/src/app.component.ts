import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="logo">Smart<span>Med</span></div>
      <div class="nav-links">
        <a routerLink="/login" routerLinkActive="active">Войти</a>
        <a routerLink="/symptoms" routerLinkActive="active">Симптомы</a>
        <a routerLink="/results" routerLinkActive="active">Результаты</a>
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`
    .navbar {
      background: #fff;
      border-bottom: 1px solid #d0e8df;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      font-family: Georgia, serif;
      font-size: 22px;
      color: #1D9E75;
      font-weight: bold;
    }
    .logo span { color: #1a2e25; }
    .nav-links { display: flex; gap: 4px; }
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
  `]
})
export class AppComponent {}
