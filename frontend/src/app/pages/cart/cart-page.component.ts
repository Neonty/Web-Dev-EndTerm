import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Cart } from '../../core/models/smartmed.models';
import { CartService } from '../../core/services/cart.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-head"><div><p class="eyebrow">Cart</p><h1>Review your medicines</h1></div></section>
    @if (cart && cart.items.length) {
      <section class="cart-layout">
        <div class="card">
          @for (item of cart.items; track item.id) {
            <div class="cart-item-row">
              <img [src]="item.medicine_image" alt="" />
              <div><b>{{ item.medicine_name }}</b><span>{{ item.price }} KZT · stock {{ item.stock_quantity }}</span></div>
              <input type="number" min="1" [max]="item.stock_quantity" [(ngModel)]="item.quantity" (change)="update(item.id, item.quantity)" />
              <strong>{{ item.subtotal }} KZT</strong>
              <button class="btn ghost small" (click)="remove(item.id)">Remove</button>
            </div>
          }
        </div>
        <aside class="card summary">
          <span>Total</span><b>{{ cart.total_price }} KZT</b>
          <a routerLink="/checkout" class="btn wide">Checkout</a>
        </aside>
      </section>
    } @else {
      <div class="empty">Your cart is empty. <a routerLink="/medicines">Open catalog</a></div>
    }
  `,
})
export class CartPageComponent implements OnInit {
  cart?: Cart;

  constructor(private cartApi: CartService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.cartApi.getCart().subscribe((cart) => (this.cart = cart));
  }

  update(id: number, quantity: number): void {
    this.cartApi.updateItem(id, quantity).subscribe((cart) => (this.cart = cart));
  }

  remove(id: number): void {
    this.cartApi.removeItem(id).subscribe((cart) => (this.cart = cart));
  }
}
