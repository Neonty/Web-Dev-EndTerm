import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Medicine, Doctor, Appointment } from '../models/medicine.model';

const MOCK_MEDICINES: Medicine[] = [
  { id: 1, name: 'Парацетамол', description: 'Снижает температуру, облегчает боль', price: 450, inStock: true },
  { id: 2, name: 'Стрепсилс', description: 'Таблетки от боли в горле', price: 1200, inStock: true },
  { id: 3, name: 'Амбробене', description: 'Отхаркивающее средство', price: 890, inStock: false },
  { id: 4, name: 'Нурофен', description: 'Противовоспалительное средство', price: 650, inStock: true },
];

const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Айгуль Сейткали', specialization: 'ЛОР', experience: 8, rating: 5 },
  { id: 2, name: 'Бауыржан Нуров', specialization: 'Терапевт', experience: 5, rating: 4 },
];

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return of({ token: 'mock-jwt-token', user: { email } });
  }

  analyzeSymptoms(symptoms: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/analyze-symptoms/`, { symptoms });
  }

  getMedicines(): Observable<Medicine[]> {
    return of(MOCK_MEDICINES);
  }

  getMedicineById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.baseUrl}/medicines/${id}/`);
  }

  getDoctors(): Observable<Doctor[]> {
    return of(MOCK_DOCTORS);
  }

  createAppointment(data: Appointment): Observable<any> {;
    return of({ id: 1, ...data, status: 'confirmed' });
  }

  getMyAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/appointments/`);
  }
}
