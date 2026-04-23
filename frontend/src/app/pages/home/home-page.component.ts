import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">KBTU full-stack medical platform</p>
        <h1>SmartMed</h1>
        <p class="lead">AI symptom guidance, doctor booking, medicine orders and medical history in one modern student project.</p>
        <div class="hero-actions">
          <a routerLink="/register" class="btn">Start as patient</a>
          <a routerLink="/login" class="btn ghost">Demo login</a>
        </div>
      </div>
      <div class="hero-panel">
        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" alt="SmartMed dashboard" />
        <div class="metric"><b>24/7</b><span>Symptom advisor</span></div>
      </div>
    </section>

    <section class="section-grid">
      <article><b>AI Assistant</b><span>Keyword-based educational diagnosis suggestions with medicine hints.</span></article>
      <article><b>Doctor Booking</b><span>Availability slots, mock payment and upcoming appointments.</span></article>
      <article><b>Pharmacy</b><span>Stock validation, cart totals, checkout and purchase history.</span></article>
      <article><b>Doctor Role</b><span>Doctors confirm final diagnosis and treatment notes after visits.</span></article>
    </section>

    <footer class="footer">
      <div><b>SmartMed</b><span>Built for KBTU Angular + Django + DRF requirements.</span></div>
      <span>Almaty, Kazakhstan</span>
      <span>support@smartmed.kz</span>
    </footer>
  `,
})
export class HomePageComponent {}
