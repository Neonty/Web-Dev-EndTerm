import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SymptomResult } from '../../core/models/smartmed.models';
import { CartService } from '../../core/services/cart.service';
import { SymptomService } from '../../core/services/symptom.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="assistant-layout">
      <article class="card">
        <p class="eyebrow">AI symptom advisor</p>
        <h1>Describe how you feel</h1>
        <label>Symptoms</label>
        <textarea [(ngModel)]="symptoms" rows="5" placeholder="fever, cough, weakness"></textarea>
        <label>Feeling description</label>
        <textarea [(ngModel)]="feeling" rows="4" placeholder="Started yesterday, temperature 38..."></textarea>
        <button class="btn wide" (click)="analyze()" [disabled]="loading">{{ loading ? 'Analyzing...' : 'Analyze symptoms' }}</button>
        @if (error) { <div class="alert error">{{ error }}</div> }
      </article>

      @if (result) {
        <article class="card result-card">
          <h2>Possible conditions</h2>
          <div class="chips">
            @for (condition of result.possible_conditions; track condition) { <span>{{ condition }}</span> }
          </div>
          <p>{{ result.recommended_action }}</p>
          <small>{{ result.warning }}</small>
          <h3>Suggested medicines</h3>
          @for (medicine of result.suggested_medicines; track medicine.id) {
            <div class="inline-item">
              <b>{{ medicine.name }}</b><span>{{ medicine.price }} KZT</span>
              <button class="btn small" (click)="addMedicine(medicine.id)">Add</button>
            </div>
          }
          <a routerLink="/doctors" class="btn ghost wide">See recommended doctors</a>
        </article>
      }
    </section>
  `,
})
export class AssistantPageComponent {
  symptoms = 'fever, cough, weakness';
  feeling = '';
  result?: SymptomResult;
  loading = false;
  error = '';

  constructor(private symptomsApi: SymptomService, private cart: CartService) {}

  analyze(): void {
    this.loading = true;
    this.error = '';
    this.symptomsApi.analyze(this.symptoms, this.feeling).subscribe({
      next: (result) => {
        this.result = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Could not analyze symptoms.';
        this.loading = false;
      },
    });
  }

  addMedicine(id: number): void {
    this.cart.add(id, 1).subscribe({ error: () => (this.error = 'Could not add suggested medicine.') });
  }
}
