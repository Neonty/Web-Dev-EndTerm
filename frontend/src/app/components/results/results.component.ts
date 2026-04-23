import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { CartService } from '../../../services/cart.service';
import { LanguageService } from '../../../services/language.service';
import { Medicine, Doctor } from '../../../models/medicine.model';
import { buildAnalyzeKeywords, SymptomCode } from '../../../services/symptom-keywords';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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

  // Review state
  expandedDoctor: number | null = null;
  reviewRatings: Record<number, number> = {};
  reviewComments: Record<number, string> = {};
  submittingReview: number | null = null;
  userReviews: Record<number, boolean> = {};

  // Booking / calendar state
  bookingDoctor: Doctor | null = null;
  availableDates: string[] = [];
  selectedDate = '';
  timeSlots: any[] = [];
  selectedSlot: any = null;
  bookingNotes = '';
  bookingLoading = false;
  bookingSubmitting = false;

  calendarYear = new Date().getFullYear();
  calendarMonth = new Date().getMonth();

  private symptomCodes: SymptomCode[] = [];
  private additionalText = '';
  private severity = '';
  private startDate = '';
  private paramsSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private languageService: LanguageService,
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

      this.symptomCodes = codes as SymptomCode[];
      this.additionalText = params['text'] ?? '';
      this.severity = params['severity'] ?? '';
      this.startDate = params['startDate'] ?? '';

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

    this.apiService.analyzeSymptoms({
      symptoms,
      codes,
      text: this.additionalText,
      severity: this.severity,
      startDate: this.startDate,
    }).subscribe({
      next: (data: { medicines: Medicine[]; doctors: Doctor[] }) => {
        this.medicines = data.medicines;
        this.doctors = data.doctors;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Analyze error:', err);
        this.error = 'Симптомдарды талдауда қате шықты';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ─── CART ─────────────────────────────────────────────

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

  isAddingToCart(medicine: Medicine): boolean {
    return medicine.id ? this.addingToCart.has(medicine.id) : false;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // ─── BOOKING ──────────────────────────────────────────

  openBooking(doctor: Doctor): void {
    if (!doctor.id) return;

    this.bookingDoctor = doctor;
    this.availableDates = [];
    this.selectedDate = '';
    this.timeSlots = [];
    this.selectedSlot = null;
    this.bookingNotes = '';
    this.bookingLoading = true;
    this.bookingSubmitting = false;
    this.calendarYear = new Date().getFullYear();
    this.calendarMonth = new Date().getMonth();
    this.cdr.markForCheck();

    this.apiService.getDoctorAvailableDates(doctor.id).subscribe({
      next: (res) => {
        this.availableDates = res.available_dates ?? [];
        this.bookingLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.bookingLoading = false;
        this.showToast('Күнтізбені жүктеу мүмкін болмады');
        this.cdr.markForCheck();
      }
    });
  }

  closeBooking(): void {
    this.bookingDoctor = null;
    this.availableDates = [];
    this.selectedDate = '';
    this.timeSlots = [];
    this.selectedSlot = null;
    this.bookingNotes = '';
    this.bookingLoading = false;
    this.bookingSubmitting = false;
    this.cdr.markForCheck();
  }

  selectDate(dateStr: string): void {
    if (!this.bookingDoctor?.id || !this.isAvailable(dateStr)) return;

    this.selectedDate = dateStr;
    this.selectedSlot = null;
    this.timeSlots = [];
    this.cdr.markForCheck();

    this.apiService.getDoctorSchedule(this.bookingDoctor.id, dateStr).subscribe({
      next: (slots) => {
        this.timeSlots = slots ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.timeSlots = [];
        this.showToast('Уақыт слоттарын жүктеу мүмкін болмады ⚠️');
        this.cdr.markForCheck();
      }
    });
  }

  selectSlot(slot: any): void {
    this.selectedSlot = slot;
    this.cdr.markForCheck();
  }

  confirmBooking(): void {
    if (!this.bookingDoctor?.id || !this.selectedSlot?.id) return;

    this.bookingSubmitting = true;
    this.cdr.markForCheck();

    this.apiService.bookAppointment({
      doctor: this.bookingDoctor.id,
      schedule: this.selectedSlot.id,
      date: `${this.selectedSlot.date}T${this.selectedSlot.start_time}`,
      notes: this.bookingNotes
    }).subscribe({
      next: () => {
        this.bookingSubmitting = false;
        const name = this.bookingDoctor?.name ?? 'Дәрігер';
        this.closeBooking();
        this.showToast(`${name} дәрігеріне жазылдыңыз ✓`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.bookingSubmitting = false;
        this.showToast(err?.error?.error ?? 'Жазылу мүмкін болмады ⚠️');
        this.cdr.markForCheck();
      }
    });
  }

  bookDoctor(doctor: Doctor): void {
    this.openBooking(doctor);
  }

  // ─── CALENDAR HELPERS ─────────────────────────────────

  get weekDays(): string[] {
    const lang = this.languageService.currentLang;
    if (lang === 'ru') return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    if (lang === 'en') return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    return ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жк'];
  }

  isAvailable(dateStr: string): boolean {
    return this.availableDates.includes(dateStr);
  }

  isSelected(dateStr: string): boolean {
    return this.selectedDate === dateStr;
  }

  isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split('T')[0];
  }

  get calendarDays(): { dateStr: string; day: number; inMonth: boolean }[] {
    const days: { dateStr: string; day: number; inMonth: boolean }[] = [];
    const first = new Date(this.calendarYear, this.calendarMonth, 1);
    const last = new Date(this.calendarYear, this.calendarMonth + 1, 0);
    const startDay = (first.getDay() + 6) % 7;

    for (let i = 0; i < startDay; i++) {
      const d = new Date(this.calendarYear, this.calendarMonth, -startDay + i + 1);
      days.push({
        dateStr: this.toDateStr(d),
        day: d.getDate(),
        inMonth: false
      });
    }

    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(this.calendarYear, this.calendarMonth, d);
      days.push({
        dateStr: this.toDateStr(dt),
        day: d,
        inMonth: true
      });
    }

    return days;
  }

  get calendarTitle(): string {
    const lang = this.languageService.currentLang;
    const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'kk-KZ';

    return new Date(this.calendarYear, this.calendarMonth).toLocaleString(locale, {
      month: 'long',
      year: 'numeric'
    });
  }

  prevMonth(): void {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else {
      this.calendarMonth--;
    }
    this.cdr.markForCheck();
  }

  nextMonth(): void {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else {
      this.calendarMonth++;
    }
    this.cdr.markForCheck();
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  // ─── REVIEWS ──────────────────────────────────────────

  toggleReviews(doctorId: number): void {
    this.expandedDoctor = this.expandedDoctor === doctorId ? null : doctorId;
    this.cdr.markForCheck();
  }

  setRating(doctorId: number, rating: number): void {
    this.reviewRatings[doctorId] = rating;
    this.cdr.markForCheck();
  }

  submitReview(doctor: Doctor): void {
    const doctorId = doctor.id;
    if (!doctorId || !this.reviewRatings[doctorId]) return;

    this.submittingReview = doctorId;

    this.apiService.addReview(doctorId, {
      rating: this.reviewRatings[doctorId],
      comment: this.reviewComments[doctorId] ?? ''
    }).subscribe({
      next: (review) => {
        if (!doctor.reviews) doctor.reviews = [];
        doctor.reviews.unshift(review);
        doctor.review_count = (doctor.review_count || 0) + 1;
        this.userReviews[doctorId] = true;
        this.submittingReview = null;
        this.showToast('Пікіріңіз қосылды ✓');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.submittingReview = null;
        this.showToast(err?.error?.error ?? 'Қате шықты ⚠️');
        this.cdr.markForCheck();
      }
    });
  }

  // ─── HELPERS ──────────────────────────────────────────

  goBackToSymptoms(): void {
    this.router.navigate(['/symptoms']);
  }

  getRatingStars(rating: number): string {
    const r = Math.round(rating || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getDoctorInitials(name: string): string {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  getDoctorStars(experienceYears: number): string {
    const stars = Math.max(1, Math.min(5, Math.round((experienceYears || 1) / 2)));
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }

  private inferDiagnosis(symptoms: string[]): string {
    const lower = symptoms.map(s => s.toLowerCase());
    if (lower.some(s => s.includes('аллерг') || s.includes('allerg'))) return 'Аллергия';
    if (lower.some(s => s.includes('живот') || s.includes('іш'))) return 'Асқазан-ішек бұзылысы';
    return 'Простуда / ОРВИ';
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => (this.toastMessage = ''), 2500);
  }
}
