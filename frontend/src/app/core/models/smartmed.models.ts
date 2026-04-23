export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  role: UserRole;
  full_name: string;
  phone: string;
  address: string;
  avatar: string;
  patient_profile?: PatientProfile;
}

export interface PatientProfile {
  age: number;
  gender: string;
  blood_type: string;
  chronic_diseases: string;
  current_diagnosis: string;
  diagnosis_updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface Doctor {
  id: number;
  full_name: string;
  email: string;
  specialization: string;
  experience_years: number;
  clinic_name: string;
  clinic_address: string;
  bio: string;
  consultation_price: string;
  average_rating: number;
  review_count: number;
  image: string;
}

export interface AvailabilitySlot {
  id: number;
  doctor: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Medicine {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  manufacturer: string;
  category: string;
  is_available: boolean;
  image: string;
  suggested_for: string;
  average_rating: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  patient_name: string;
  created_at: string;
}

export interface SymptomResult {
  possible_conditions: string[];
  recommended_action: string;
  warning: string;
  suggested_medicines: Medicine[];
  report: SymptomReport;
}

export interface SymptomReport {
  id: number;
  symptoms_text: string;
  feeling_description: string;
  predicted_condition: string;
  ai_recommendation: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  medicine: number;
  medicine_name: string;
  medicine_image: string;
  price: string;
  stock_quantity: number;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  item_count: number;
}

export interface Appointment {
  id: number;
  patient_name: string;
  doctor: number;
  doctor_name: string;
  doctor_specialization: string;
  clinic_address: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  price: string;
  patient_note: string;
  doctor_note: string;
  final_diagnosis: string;
  is_paid: boolean;
}

export interface Order {
  id: number;
  total_price: string;
  status: string;
  delivery_address: string;
  payment_method: string;
  is_paid: boolean;
  created_at: string;
  items: Array<{ id: number; medicine_name: string; quantity: number; price_at_purchase: string }>;
}
