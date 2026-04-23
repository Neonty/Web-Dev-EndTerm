import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { AvailabilitySlot, Doctor, Review } from '../../core/models/smartmed.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (doctor) {
      <section class="detail-grid">
        <article class="card profile-card">
          <img [src]="doctor.image || fallback" [alt]="doctor.full_name" />
          <h1>{{ doctor.full_name }}</h1>
          <p>{{ doctor.specialization }} · {{ doctor.experience_years }} years</p>
          <p>{{ doctor.clinic_name }} · {{ doctor.clinic_address }}</p>
          <b>{{ doctor.consultation_price }} KZT</b>
        </article>

        <article class="card">
          <h2>Available slots</h2>
          <div class="slot-grid">
            @for (slot of slots; track slot.id) {
              <button class="slot" [class.selected]="selected?.id === slot.id" (click)="selected = slot">
                {{ slot.date }}<span>{{ slot.start_time.slice(0,5) }}</span>
              </button>
            }
          </div>
          <label>Patient note</label>
          <textarea [(ngModel)]="patient_note" rows="3" placeholder="Describe your concern"></textarea>
          <button class="btn" (click)="book()" [disabled]="!selected || loading">{{ loading ? 'Booking...' : 'Book appointment' }}</button>
          @if (message) { <div class="alert success">{{ message }}</div> }
          @if (error) { <div class="alert error">{{ error }}</div> }
        </article>
      </section>

      <section class="card reviews">
        <h2>Reviews</h2>
        <div class="review-form">
          <select [(ngModel)]="rating"><option [ngValue]="5">5</option><option [ngValue]="4">4</option><option [ngValue]="3">3</option></select>
          <input [(ngModel)]="comment" placeholder="Leave a review" />
          <button class="btn small" (click)="submitReview()">Submit review</button>
        </div>
        @for (review of reviews; track review.id) {
          <p><b>★ {{ review.rating }}</b> {{ review.comment }} <span class="muted">- {{ review.patient_name }}</span></p>
        }
      </section>
    }
  `,
})
export class DoctorDetailPageComponent implements OnInit {
  doctor?: Doctor;
  slots: AvailabilitySlot[] = [];
  reviews: Review[] = [];
  selected?: AvailabilitySlot;
  patient_note = '';
  rating = 5;
  comment = '';
  loading = false;
  error = '';
  message = '';
  fallback = 'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=900&q=80';

  constructor(private route: ActivatedRoute, private doctors: DoctorService, private appointments: AppointmentService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctors.detail(id).subscribe((doctor) => (this.doctor = doctor));
    this.doctors.availability(id).subscribe((slots) => (this.slots = slots));
    this.doctors.reviews(id).subscribe((reviews) => (this.reviews = reviews));
  }

  book(): void {
    if (!this.doctor || !this.selected) return;
    this.loading = true;
    this.error = '';
    this.appointments.book({ doctor: this.doctor.id, availability: this.selected.id, appointment_date: this.selected.date, appointment_time: this.selected.start_time, patient_note: this.patient_note }).subscribe({
      next: () => {
        this.message = 'Appointment booked. You can pay it from Appointments.';
        this.slots = this.slots.filter((slot) => slot.id !== this.selected?.id);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Booking failed.';
        this.loading = false;
      },
    });
  }

  submitReview(): void {
    if (!this.doctor) return;
    this.doctors.submitReview(this.doctor.id, this.rating, this.comment).subscribe((review) => {
      this.reviews = [review, ...this.reviews.filter((item) => item.id !== review.id)];
      this.comment = '';
    });
  }
}
