import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Medicine, Review } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  constructor(private api: ApiService) {}

  list() {
    return this.api.get<Medicine[]>('/medicines/');
  }

  detail(id: number) {
    return this.api.get<Medicine>(`/medicines/${id}/`);
  }

  reviews(id: number) {
    return this.api.get<Review[]>(`/medicines/${id}/reviews/`);
  }

  submitReview(id: number, rating: number, comment: string) {
    return this.api.post<Review>(`/medicines/${id}/reviews/`, { rating, comment });
  }
}
