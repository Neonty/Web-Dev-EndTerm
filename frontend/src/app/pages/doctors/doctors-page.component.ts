import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Doctor } from '../../core/models/smartmed.models';
import { DoctorService } from '../../core/services/doctor.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head">
      <div><p class="eyebrow">Recommended doctors</p><h1>Book trusted specialists</h1></div>
      <button class="btn ghost" (click)="loadRecommended()">Top rated</button>
    </section>
    @if (error) { <div class="alert error">{{ error }}</div> }
    <section class="cards three">
      @for (doctor of doctors; track doctor.id) {
        <article class="card doctor-card">
          <img [src]="doctor.image || fallback" [alt]="doctor.full_name" />
          <div>
            <span class="badge">{{ doctor.specialization }}</span>
            <h3>{{ doctor.full_name }}</h3>
            <p>{{ doctor.bio }}</p>
            <div class="meta">★ {{ doctor.average_rating }} · {{ doctor.experience_years }} years · {{ doctor.consultation_price }} KZT</div>
            <a class="btn small" [routerLink]="['/doctors', doctor.id]">View profile</a>
          </div>
        </article>
      }
    </section>
  `,
})
export class DoctorsPageComponent implements OnInit {
  doctors: Doctor[] = [];
  error = '';
  fallback = 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=900&q=80';

  constructor(private doctorsApi: DoctorService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.doctorsApi.list().subscribe({ next: (doctors) => (this.doctors = doctors), error: () => (this.error = 'Could not load doctors.') });
  }

  loadRecommended(): void {
    this.doctorsApi.list(true).subscribe({ next: (doctors) => (this.doctors = doctors), error: () => (this.error = 'Could not load recommendations.') });
  }
}
