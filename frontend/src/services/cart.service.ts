import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  constructor(private api: ApiService) {}

  refresh(): void {
    this.api.getCart().subscribe({
      next: (res) => this.countSubject.next(res.count),
      error: () => this.countSubject.next(0)
    });
  }

  setCount(n: number): void {
    this.countSubject.next(n);
  }

  increment(): void {
    this.countSubject.next(this.countSubject.value + 1);
  }

  decrement(): void {
    const val = this.countSubject.value;
    this.countSubject.next(val > 0 ? val - 1 : 0);
  }

  reset(): void {
    this.countSubject.next(0);
  }
}