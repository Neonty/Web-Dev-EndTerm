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

export interface CartItem {
  id: number;
  medicine: number;
  medicine_name: string;
  medicine_price: number;
  quantity: number;
  total_price: number;
  added_at: string;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}

export interface OrderItem {
  id: number;
  medicine: number;
  medicine_name: string;
  quantity: number;
  price: number;
}

export interface AppointmentInfo {
  id: number;
  doctor: string;
  specialization: string;
  date: string;
  status: string;
}

export interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  appointment_info: AppointmentInfo | null;
}

export interface CheckoutPayload {
  card_number: string;
  card_expiry: string;
  card_cvv: string;
  appointment_id?: number | null;
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

  // ─── AUTH ──────────────────────────────────────────────

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

  // ─── PROFILE ───────────────────────────────────────────

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

  // ─── MEDICINES ─────────────────────────────────────────

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.baseUrl}/medicines/`);
  }

  getMedicineById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.baseUrl}/medicines/${id}/`);
  }

  // ─── DOCTORS ───────────────────────────────────────────

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors/`);
  }

  // ─── APPOINTMENTS ──────────────────────────────────────

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

  // ─── SYMPTOMS / AI ─────────────────────────────────────

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

  // ─── CART ──────────────────────────────────────────────

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart/`, {
      headers: this.getAuthHeaders()
    });
  }

  addToCart(medicineId: number, quantity = 1): Observable<CartItem> {
    return this.http.post<CartItem>(
      `${this.baseUrl}/cart/add/`,
      { medicine_id: medicineId, quantity },
      { headers: this.getAuthHeaders() }
    );
  }

  updateCartItem(itemId: number, quantity: number): Observable<CartItem> {
    return this.http.patch<CartItem>(
      `${this.baseUrl}/cart/${itemId}/update/`,
      { quantity },
      { headers: this.getAuthHeaders() }
    );
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/cart/${itemId}/remove/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ─── CHECKOUT ──────────────────────────────────────────

  checkout(payload: CheckoutPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout/`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── ORDER HISTORY ─────────────────────────────────────

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/`, {
      headers: this.getAuthHeaders()
    });
  }
    addReview(doctorId: number, data: { rating: number; comment: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/doctors/${doctorId}/reviews/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
 
  getReviews(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/doctors/${doctorId}/reviews/`,
      { headers: this.getAuthHeaders() }
    );
  }
}

