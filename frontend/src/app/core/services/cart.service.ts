import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Cart } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private countSubject = new BehaviorSubject(0);
  count$ = this.countSubject.asObservable();

  constructor(private api: ApiService) {}

  getCart() {
    return this.api.get<Cart>('/cart/').pipe(tap((cart) => this.countSubject.next(cart.item_count)));
  }

  add(medicine_id: number, quantity: number) {
    return this.api.post<Cart>('/cart/add/', { medicine_id, quantity }).pipe(tap((cart) => this.countSubject.next(cart.item_count)));
  }

  updateItem(id: number, quantity: number) {
    return this.api.put<Cart>(`/cart/items/${id}/`, { quantity }).pipe(tap((cart) => this.countSubject.next(cart.item_count)));
  }

  removeItem(id: number) {
    return this.api.delete<Cart>(`/cart/items/${id}/`).pipe(tap((cart) => this.countSubject.next(cart.item_count)));
  }

  refreshCount() {
    this.api.get<{ count: number }>('/cart/count/').subscribe((response) => this.countSubject.next(response.count));
  }
}
