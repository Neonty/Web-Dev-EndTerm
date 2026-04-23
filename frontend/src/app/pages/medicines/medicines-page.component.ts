import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CartService } from '../../core/services/cart.service';
import { MedicineService } from '../../core/services/medicine.service';
import { Medicine } from '../../core/models/smartmed.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-head">
      <div><p class="eyebrow">Medicine catalog</p><h1>Order pharmacy items</h1></div>
      <button class="btn ghost" (click)="load()">Refresh</button>
    </section>
    @if (message) { <div class="alert success">{{ message }}</div> }
    @if (error) { <div class="alert error">{{ error }}</div> }
    <section class="cards three">
      @for (medicine of medicines; track medicine.id) {
        <article class="card med-card">
          <img [src]="medicine.image || fallback" [alt]="medicine.name" />
          <span class="badge">{{ medicine.category }}</span>
          <h3>{{ medicine.name }}</h3>
          <p>{{ medicine.description }}</p>
          <div class="meta">★ {{ medicine.average_rating }} · stock {{ medicine.stock_quantity }}</div>
          <div class="buy-row">
            <b>{{ medicine.price }} KZT</b>
            <input type="number" min="1" [max]="medicine.stock_quantity" [(ngModel)]="quantities[medicine.id]" />
            <button class="btn small" (click)="addToCart(medicine)">Add</button>
          </div>
        </article>
      }
    </section>
  `,
})
export class MedicinesPageComponent implements OnInit {
  medicines: Medicine[] = [];
  quantities: Record<number, number> = {};
  message = '';
  error = '';
  fallback = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80';

  constructor(private medicinesApi: MedicineService, private cart: CartService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.medicinesApi.list().subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        medicines.forEach((medicine) => (this.quantities[medicine.id] = this.quantities[medicine.id] || 1));
      },
      error: () => (this.error = 'Could not load medicines.'),
    });
  }

  addToCart(medicine: Medicine): void {
    this.cart.add(medicine.id, this.quantities[medicine.id] || 1).subscribe({
      next: () => (this.message = `${medicine.name} added to cart.`),
      error: (err) => (this.error = err?.error?.detail || 'Could not add to cart.'),
    });
  }
}
