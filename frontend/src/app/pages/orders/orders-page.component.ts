import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Order } from '../../core/models/smartmed.models';
import { OrderService } from '../../core/services/order.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-head"><div><p class="eyebrow">Purchase history</p><h1>Orders</h1></div></section>
    <section class="cards">
      @for (order of orders; track order.id) {
        <article class="card">
          <div class="split"><h3>Order #{{ order.id }}</h3><span class="badge">{{ order.status }}</span></div>
          <p>{{ order.delivery_address }} · {{ order.created_at | date:'medium' }}</p>
          @for (item of order.items; track item.id) {
            <div class="inline-item"><span>{{ item.medicine_name }} x{{ item.quantity }}</span><b>{{ item.price_at_purchase }} KZT</b></div>
          }
          <h3>{{ order.total_price }} KZT</h3>
        </article>
      } @empty {
        <div class="empty">No orders yet.</div>
      }
    </section>
  `,
})
export class OrdersPageComponent implements OnInit {
  orders: Order[] = [];
  constructor(private ordersApi: OrderService) {}
  ngOnInit(): void {
    this.ordersApi.history().subscribe((orders) => (this.orders = orders));
  }
}
