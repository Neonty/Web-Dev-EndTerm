import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { User } from '../../core/models/smartmed.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (user) {
      <section class="profile-layout">
        <article class="card">
          <p class="eyebrow">{{ user.profile.role }} profile</p>
          <h1>{{ user.profile.full_name || user.username }}</h1>
          <label>Email</label>
          <input [(ngModel)]="user.email" />
          <label>Full name</label>
          <input [(ngModel)]="user.profile.full_name" />
          <label>Phone</label>
          <input [(ngModel)]="user.profile.phone" />
          <label>Address</label>
          <input [(ngModel)]="user.profile.address" />
          @if (user.profile.patient_profile) {
            <label>Age</label>
            <input type="number" [(ngModel)]="user.profile.patient_profile.age" />
            <label>Blood type</label>
            <input [(ngModel)]="user.profile.patient_profile.blood_type" />
            <label>Chronic diseases</label>
            <textarea [(ngModel)]="user.profile.patient_profile.chronic_diseases"></textarea>
          }
          <button class="btn" (click)="save()">Save profile</button>
        </article>
        @if (user.profile.patient_profile) {
          <aside class="card diagnosis-card">
            <span class="badge">Doctor-controlled field</span>
            <h2>Current diagnosis</h2>
            <p>{{ user.profile.patient_profile.current_diagnosis }}</p>
            <small>Patients can view this field, but only doctors can update it after an appointment.</small>
          </aside>
        }
      </section>
    }
  `,
})
export class ProfilePageComponent implements OnInit {
  user?: User;
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user) this.user = structuredClone(user);
    });
  }

  save(): void {
    if (!this.user) return;
    this.auth.updateProfile(this.user).subscribe((user) => (this.user = structuredClone(user)));
  }
}
