import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine, Doctor, Appointment } from '../models/medicine.model';

export interface UserProfile {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  about?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access');
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, { username, password });
  }

  register(data: {
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password_confirm: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, data);
  }

  analyzeSymptoms(payload: {
    symptoms: string[];
    text?: string;
    severity?: string;
    startDate?: string;
    codes?: string[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/analyze/`, payload);
  }

  aiSymptomAdvice(payload: {
    symptomCodes: string[];
    text?: string;
    severity?: string;
    startDate?: string;
    lang?: 'kk' | 'ru' | 'en';
  }): Observable<{ advice: string }> {
    return this.http.post<{ advice: string }>(`${this.baseUrl}/ai/symptoms/`, payload);
  }

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.baseUrl}/medicines/`);
  }

  getMedicineById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.baseUrl}/medicines/${id}/`);
  }

getDoctors(): Observable<Doctor[]> {
  return this.http.get<Doctor[]>(`${this.baseUrl}/doctors/`);
}

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/`, {
      headers: this.getAuthHeaders()
    });
  }

  createAppointment(data: Appointment): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me/`, {
      headers: this.getAuthHeaders()
    });
  }

  updateMyProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/me/`, data, {
      headers: this.getAuthHeaders()
    });
  }
}