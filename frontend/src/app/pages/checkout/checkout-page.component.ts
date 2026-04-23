import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { OrderService } from '../../core/services/order.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="auth-shell">
      <form class="card auth-card" (ngSubmit)="pay()">
        <p class="eyebrow">Mock payment</p>
        <h1>Checkout</h1>
        <label>Delivery address</label>
        <input [(ngModel)]="delivery_address" name="delivery_address" />
        <label>Card holder</label>
        <input [(ngModel)]="card_holder_name" name="card_holder_name" />
        <label>Card number</label>
        <input [(ngModel)]="card_number" name="card_number" placeholder="4242424242424242" />
        <div class="two-col">
          <div><label>Expiry</label><input [(ngModel)]="expiry" name="expiry" placeholder="12/28" /></div>
          <div><label>CVV</label><input [(ngModel)]="cvv" name="cvv" placeholder="123" /></div>
        </div>
        <button class="btn wide" type="submit">Pay now</button>
        @if (error) { <div class="alert error">{{ error }}</div> }
      </form>
    </section>
  `,
})
export class CheckoutPageComponent {
  delivery_address = 'Almaty, KBTU';
  card_holder_name = 'Aruzhan Patient';
  card_number = '4242424242424242';
  expiry = '12/28';
  cvv = '123';
  error = '';

  constructor(private orders: OrderService, private router: Router) {}

  pay(): void {
    this.orders.create({ delivery_address: this.delivery_address, card_holder_name: this.card_holder_name, card_number: this.card_number, expiry: this.expiry, cvv: this.cvv }).subscribe({
      next: () => this.router.navigateByUrl('/orders'),
      error: (err) => (this.error = err?.error?.detail || 'Payment failed.'),
    });
  }
}
