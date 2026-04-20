import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { ApiService, CartItem } from '../../../services/api.service';
import { CartService } from '../../../services/cart.service';

type PayMethod = 'card' | 'qr';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;

  items: CartItem[] = [];
  total = 0;
  loading = false;
  paying = false;
  success = false;
  error = '';
  orderId: number | null = null;

  payMethod: PayMethod = 'card';

  // Card fields
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  cardName = '';

  // QR
  qrGenerated = false;
  qrChecking = false;

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api.getCart().subscribe({
      next: (res) => {
        this.items = res.items;
        this.total = res.total;
        if (res.items.length === 0) {
          this.router.navigate(['/cart']);
        }
        this.cdr.markForCheck();
      }
    });
  }

  selectMethod(method: PayMethod): void {
    this.payMethod = method;
    this.qrGenerated = false;
    this.error = '';
    if (method === 'qr') {
      setTimeout(() => this.generateQR(), 100);
    }
  }

  generateQR(): void {
    const canvas = this.qrCanvas?.nativeElement;
    if (!canvas) return;

    const qrData = JSON.stringify({
      app: 'SmartMed',
      amount: this.total,
      currency: 'KZT',
      orderId: `SM-${Date.now()}`,
    });

    QRCode.toCanvas(canvas, qrData, {
      width: 220,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' }
    });

    this.qrGenerated = true;
    this.cdr.markForCheck();
  }

  confirmQrPayment(): void {
    this.qrChecking = true;
    this.error = '';

    // Fake QR processing — 2 секунд күту
    setTimeout(() => {
      this.api.checkout({
        card_number: '0000000000000000',
        card_expiry: '00/00',
        card_cvv: '000',
      }).subscribe({
        next: (res) => {
          this.success = true;
          this.orderId = res.order_id;
          this.qrChecking = false;
          this.cartService.reset();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err?.error?.error ?? 'Төлем сәтсіз аяқталды';
          this.qrChecking = false;
          this.cdr.markForCheck();
        }
      });
    }, 2000);
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = val.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 4);
    this.cardExpiry = val.length >= 3 ? val.slice(0, 2) + '/' + val.slice(2) : val;
  }

  payByCard(): void {
    if (!this.cardNumber || !this.cardExpiry || !this.cardCvv) {
      this.error = 'Барлық өрісті толтырыңыз';
      return;
    }
    this.paying = true;
    this.error = '';

    setTimeout(() => {
      this.api.checkout({
        card_number: this.cardNumber.replace(/\s/g, ''),
        card_expiry: this.cardExpiry,
        card_cvv: this.cardCvv,
      }).subscribe({
        next: (res) => {
          this.success = true;
          this.orderId = res.order_id;
          this.paying = false;
          this.cartService.reset();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err?.error?.error ?? 'Төлем сәтсіз аяқталды';
          this.paying = false;
          this.cdr.markForCheck();
        }
      });
    }, 2000);
  }

  goOrders(): void {
    this.router.navigate(['/orders']);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}