import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService, UserProfile } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly profileKey = 'smartmed_profile';
  private readonly authState$ = new BehaviorSubject<boolean>(this.isAuthenticated());
  private readonly profileState$ = new BehaviorSubject<UserProfile | null>(this.readProfile());

  constructor(private apiService: ApiService) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access');
  }

  authChanges() {
    return this.authState$.asObservable();
  }

  profileChanges() {
    return this.profileState$.asObservable();
  }

  getProfile(): UserProfile | null {
    return this.profileState$.value;
  }

  setTokens(access: string, refresh?: string): void {
    localStorage.setItem('access', access);
    if (refresh) {
      localStorage.setItem('refresh', refresh);
    }
    this.authState$.next(true);
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem(this.profileKey);
    this.profileState$.next(null);
    this.authState$.next(false);
  }

  refreshProfileFromApi(): void {
    if (!this.isAuthenticated()) {
      return;
    }
    this.apiService.getMyProfile().subscribe({
      next: (profile) => {
        localStorage.setItem(this.profileKey, JSON.stringify(profile));
        this.profileState$.next(profile);
      },
      error: () => {
        // Backend profile endpoint may temporarily fail; keep UI stable.
      }
    });
  }

  saveLocalProfile(profile: UserProfile): void {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
    this.profileState$.next(profile);
  }

  private readProfile(): UserProfile | null {
    const raw = localStorage.getItem(this.profileKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
}
