import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, CartItem } from '../../../services/api.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  total = 0;
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.api.getCart().subscribe({
      next: (res) => {
        this.items = res.items;
        this.total = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Корзинаны жүктеу мүмкін болмады';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateQuantity(item: CartItem, quantity: number): void {
    this.api.updateCartItem(item.id, quantity).subscribe({
      next: () => {
        this.loadCart();
        this.cartService.refresh();
      }
    });
  }

  remove(item: CartItem): void {
    this.api.removeFromCart(item.id).subscribe({
      next: () => {
        this.loadCart();
        this.cartService.decrement();
      }
    });
  }

  goCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  goBack(): void {
    this.router.navigate(['/symptoms']);
  }
}