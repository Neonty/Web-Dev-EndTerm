export interface Medicine {
  id?: number;
  name: string;
  description?: string;
  price: number;
  inStock?: boolean;
  stock: number;
  symptoms?: number[];
}

export interface Review {
  id?: number;
  username: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Doctor {
  id?: number;
  name: string;
  specialization: string;
  experience_years: number;
  symptoms?: number[];
  average_rating?: number;
  review_count?: number;
  reviews?: Review[];
  address?: string;
}

export interface Appointment {
  id?: number;
  doctor: number;
  date: string;
  status?: string;
}