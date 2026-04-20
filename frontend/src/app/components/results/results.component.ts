import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { CartService } from '../../../services/cart.service';
import { Medicine, Doctor } from '../../../models/medicine.model';
import { buildAnalyzeKeywords, SymptomCode } from '../../../services/symptom-keywords';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit, OnDestroy {
  medicines: Medicine[] = [];
  doctors: Doctor[] = [];
  loading = false;
  error = '';
  selectedSymptoms: string[] = [];
  diagnosis = '';
  toastMessage = '';
  addingToCart: Set<number> = new Set();

  private symptomCodes: SymptomCode[] = [];
  private additionalText = '';
  private severity = '';
  private startDate = '';
  private paramsSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.paramsSub = this.route.queryParams.subscribe(params => {
      const codesRaw = params['codes'] ?? '';
      const codes = codesRaw
        ? (codesRaw as string).split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      if (codes.length === 0) {
        this.router.navigate(['/symptoms']);
        return;
      }

      this.symptomCodes   = codes as SymptomCode[];
      this.additionalText = params['text']      ?? '';
      this.severity       = params['severity']  ?? '';
      this.startDate      = params['startDate'] ?? '';

      const keywords = buildAnalyzeKeywords(this.symptomCodes, this.additionalText);
      this.selectedSymptoms = keywords.slice(0, 6);
      this.diagnosis = this.inferDiagnosis(keywords);
      this.analyze(keywords, this.symptomCodes);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  private analyze(symptoms: string[], codes: SymptomCode[]): void {
    this.loading = true;
    this.error = '';
    this.medicines = [];
    this.doctors = [];

    this.apiService
      .analyzeSymptoms({
        symptoms,
        codes,
        text: this.additionalText,
        severity: this.severity,
        startDate: this.startDate,
      })
      .subscribe({
        next: (data: { medicines: Medicine[]; doctors: Doctor[] }) => {
          this.medicines = data.medicines;
          this.doctors   = data.doctors;
          this.loading   = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Analyze error:', err);
          this.error   = 'Симптомдарды талдауда қате шықты';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  goBackToSymptoms(): void {
    this.router.navigate(['/symptoms']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  buyMedicine(medicine: Medicine): void {
    if (!medicine.id || this.addingToCart.has(medicine.id)) return;

    this.addingToCart.add(medicine.id);
    this.cdr.markForCheck();

    this.apiService.addToCart(medicine.id, 1).subscribe({
      next: () => {
        this.cartService.increment();
        this.addingToCart.delete(medicine.id!);
        this.showToast(`${medicine.name ?? 'Дәрі'} корзинаға қосылды ✓`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.addingToCart.delete(medicine.id!);
        this.showToast('Қосу мүмкін болмады ⚠️');
        this.cdr.markForCheck();
      }
    });
  }

  bookDoctor(doctor: Doctor): void {
    this.showToast(`${doctor.name ?? 'Дәрігер'} дәрігеріне жазылу басталды`);
  }

  isAddingToCart(medicine: Medicine): boolean {
    return medicine.id ? this.addingToCart.has(medicine.id) : false;
  }

  getDoctorInitials(name: string): string {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  getDoctorStars(experienceYears: number): string {
    const stars = Math.max(1, Math.min(5, Math.round((experienceYears || 1) / 2)));
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }

  private inferDiagnosis(symptoms: string[]): string {
    const lower = symptoms.map(s => s.toLowerCase());
    if (lower.some(s => s.includes('аллерг') || s.includes('allerg'))) {
      return 'Аллергия';
    }
    if (lower.some(s => s.includes('живот') || s.includes('іш'))) {
      return 'Асқазан-ішек бұзылысы';
    }
    return 'Простуда / ОРВИ';
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => (this.toastMessage = ''), 2000);
  }
}