import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/smartmed.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <form class="card auth-card" (ngSubmit)="submit()">
        <p class="eyebrow">{{ mode === 'login' ? 'Welcome back' : 'Create account' }}</p>
        <h2>{{ mode === 'login' ? 'Login to SmartMed' : 'Register SmartMed profile' }}</h2>
        @if (error) { <div class="alert error">{{ error }}</div> }

        @if (mode === 'register') {
          <label>Full name</label>
          <input [(ngModel)]="full_name" name="full_name" placeholder="Aruzhan Patient" />
          <label>Email</label>
          <input [(ngModel)]="email" name="email" type="email" placeholder="you@kbtu.kz" />
          <label>Role</label>
          <select [(ngModel)]="role" name="role">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          @if (role === 'doctor') {
            <label>Specialization</label>
            <input [(ngModel)]="specialization" name="specialization" placeholder="Therapist" />
          }
          <label>Phone</label>
          <input [(ngModel)]="phone" name="phone" placeholder="+7 701 000 0000" />
          <label>Address</label>
          <input [(ngModel)]="address" name="address" placeholder="Almaty" />
        }

        <label>Username</label>
        <input [(ngModel)]="username" name="username" placeholder="patient_demo" />
        <label>Password</label>
        <input [(ngModel)]="password" name="password" type="password" placeholder="patient123" />

        <button class="btn wide" type="submit" [disabled]="loading">{{ loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account' }}</button>
        <p class="muted">
          {{ mode === 'login' ? 'No account?' : 'Already registered?' }}
          <a [routerLink]="mode === 'login' ? '/register' : '/login'">{{ mode === 'login' ? 'Register' : 'Login' }}</a>
        </p>
      </form>
    </section>
  `,
})
export class AuthPageComponent {
  mode: 'login' | 'register' = 'login';
  username = 'patient_demo';
  email = '';
  password = 'patient123';
  role: UserRole = 'patient';
  full_name = '';
  phone = '';
  address = '';
  specialization = '';
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.route.data.subscribe((data) => {
      this.mode = data['mode'] ?? 'login';
      this.error = '';
    });
  }

  submit(): void {
    this.loading = true;
    this.error = '';
    const request =
      this.mode === 'login'
        ? this.auth.login(this.username, this.password)
        : this.auth.register({ username: this.username, email: this.email, password: this.password, role: this.role, full_name: this.full_name, phone: this.phone, address: this.address, specialization: this.specialization });
    request.subscribe({
      next: () => this.router.navigateByUrl('/assistant'),
      error: (err) => {
        this.error = err?.error?.detail || 'Request failed. Check form values and backend server.';
        this.loading = false;
      },
    });
  }
}
