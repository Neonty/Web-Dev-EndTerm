import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from './api.service';
import { AuthResponse, User, UserRole } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    if (this.accessToken) {
      this.loadProfile().subscribe({ error: () => this.clearSession() });
    }
  }

  get accessToken(): string | null {
    return localStorage.getItem('smartmed_access');
  }

  get refreshToken(): string | null {
    return localStorage.getItem('smartmed_refresh');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  login(username: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login/', { username, password }).pipe(
      tap((response) => this.storeTokens(response)),
      tap(() => this.loadProfile().subscribe())
    );
  }

  register(payload: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    full_name: string;
    phone: string;
    address: string;
    specialization?: string;
  }) {
    return this.api.post<AuthResponse>('/auth/register/', payload).pipe(
      tap((response) => {
        this.storeTokens(response);
        if (response.user) this.userSubject.next(response.user);
      })
    );
  }

  loadProfile() {
    return this.api.get<User>('/auth/profile/').pipe(tap((user) => this.userSubject.next(user)));
  }

  updateProfile(payload: Partial<User>) {
    return this.api.put<User>('/auth/profile/', payload).pipe(tap((user) => this.userSubject.next(user)));
  }

  logout() {
    const refresh = this.refreshToken;
    this.api.post('/auth/logout/', { refresh }).pipe(catchError(() => throwError(() => null))).subscribe();
    this.clearSession();
    this.router.navigateByUrl('/');
  }

  private storeTokens(response: AuthResponse) {
    localStorage.setItem('smartmed_access', response.access);
    localStorage.setItem('smartmed_refresh', response.refresh);
  }

  private clearSession() {
    localStorage.removeItem('smartmed_access');
    localStorage.removeItem('smartmed_refresh');
    this.userSubject.next(null);
  }
}
