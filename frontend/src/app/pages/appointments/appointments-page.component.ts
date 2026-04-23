import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Appointment } from '../../core/models/smartmed.models';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-head"><div><p class="eyebrow">{{ isDoctor ? 'Doctor dashboard' : 'Upcoming appointments' }}</p><h1>Appointments</h1></div></section>
    @if (error) { <div class="alert error">{{ error }}</div> }
    <section class="cards">
      @for (appointment of appointments; track appointment.id) {
        <article class="card">
          <div class="split"><h3>{{ isDoctor ? appointment.patient_name : appointment.doctor_name }}</h3><span class="badge">{{ appointment.status }}</span></div>
          <p>{{ appointment.doctor_specialization }} · {{ appointment.appointment_date }} at {{ appointment.appointment_time.slice(0,5) }}</p>
          <p>{{ appointment.clinic_address }}</p>
          @if (!isDoctor) {
            <button class="btn small" (click)="pay(appointment)" [disabled]="appointment.is_paid">Pay {{ appointment.price }} KZT</button>
            <button class="btn ghost small" (click)="cancel(appointment)">Cancel</button>
          } @else {
            <label>Final diagnosis</label>
            <input [(ngModel)]="appointment.final_diagnosis" placeholder="Confirmed diagnosis" />
            <label>Doctor note</label>
            <textarea [(ngModel)]="appointment.doctor_note" rows="2"></textarea>
            <button class="btn small" (click)="saveDiagnosis(appointment)">Save diagnosis</button>
          }
        </article>
      } @empty {
        <div class="empty">No appointments found.</div>
      }
    </section>
  `,
})
export class AppointmentsPageComponent implements OnInit {
  appointments: Appointment[] = [];
  isDoctor = false;
  error = '';

  constructor(private appointmentsApi: AppointmentService, private auth: AuthService) {}

  ngOnInit(): void {
    this.isDoctor = this.auth.currentUser?.profile.role === 'doctor';
    this.load();
  }

  load(): void {
    this.appointmentsApi.list().subscribe((appointments) => (this.appointments = appointments));
  }

  pay(appointment: Appointment): void {
    this.appointmentsApi.pay(appointment.id, { card_holder_name: 'Demo User', card_number: '4242424242424242', expiry: '12/28', cvv: '123' }).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.detail || 'Payment failed.'),
    });
  }

  cancel(appointment: Appointment): void {
    this.appointmentsApi.cancel(appointment.id).subscribe(() => this.load());
  }

  saveDiagnosis(appointment: Appointment): void {
    this.appointmentsApi.updateDiagnosis(appointment.id, appointment.final_diagnosis, appointment.doctor_note).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.detail || 'Could not update diagnosis.'),
    });
  }
}
