import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AvailabilitySlot, Doctor, Review } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private api: ApiService) {}

  list(recommended = false) {
    return this.api.get<Doctor[]>(`/doctors/${recommended ? '?recommended=1' : ''}`);
  }

  detail(id: number) {
    return this.api.get<Doctor>(`/doctors/${id}/`);
  }

  availability(id: number) {
    return this.api.get<AvailabilitySlot[]>(`/doctors/${id}/availability/`);
  }

  reviews(id: number) {
    return this.api.get<Review[]>(`/doctors/${id}/reviews/`);
  }

  submitReview(id: number, rating: number, comment: string) {
    return this.api.post<Review>(`/doctors/${id}/reviews/`, { rating, comment });
  }
}
