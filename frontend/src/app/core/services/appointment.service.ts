import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Appointment } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  list() {
    return this.api.get<Appointment[]>('/appointments/');
  }

  book(payload: { doctor: number; availability: number; appointment_date: string; appointment_time: string; patient_note: string }) {
    return this.api.post<Appointment>('/appointments/create/', payload);
  }

  pay(id: number, payload: unknown) {
    return this.api.put<Appointment>(`/appointments/${id}/pay/`, payload);
  }

  cancel(id: number) {
    return this.api.put<Appointment>(`/appointments/${id}/cancel/`, {});
  }

  updateDiagnosis(id: number, final_diagnosis: string, doctor_note: string) {
    return this.api.put<Appointment>(`/appointments/${id}/diagnosis/`, { final_diagnosis, doctor_note, mark_completed: true });
  }
}
