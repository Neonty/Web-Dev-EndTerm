export interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  inStock?: boolean;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience_years: number;
  symptoms?: number[];
}
export interface Appointment {
  id?: number;
  doctor: number;
  date: string;
  status?: string;
}