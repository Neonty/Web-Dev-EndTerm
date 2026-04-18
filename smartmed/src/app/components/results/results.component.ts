import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Medicine, Doctor, Appointment } from '../../../models/medicine.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  medicines: Medicine[] = [];
  doctors: Doctor[] = [];
  isLoading = true;
  symptoms: string[] = [];
  toastMessage = '';
  showToast = false;

  constructor(private apiService: ApiService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.symptoms = nav?.extras?.state?.['symptoms'] || [];
  }

  ngOnInit() {
    this.apiService.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });

    this.apiService.getDoctors().subscribe((data) => {
      this.doctors = data;
    });
  }

  onBuy(med: Medicine) {
    this.displayToast(med.name + ' добавлен в корзину!');
  }

  onBook(doc: Doctor) {
    const appointment: Appointment = {
      doctorId: doc.id,
      date: new Date().toISOString(),
      symptoms: this.symptoms.join(', '),
    };

    this.apiService.createAppointment(appointment).subscribe({
      next: () => this.displayToast('Запись к ' + doc.name + ' подтверждена!'),
      error: () => this.displayToast('Ошибка. Попробуйте снова.'),
    });
  }

  displayToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
