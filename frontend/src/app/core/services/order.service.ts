import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Order } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}

  create(payload: unknown) {
    return this.api.post<Order>('/orders/create/', payload);
  }

  history() {
    return this.api.get<Order[]>('/orders/history/');
  }
}
