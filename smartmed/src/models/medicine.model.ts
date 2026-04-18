export interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
}

export interface Appointment {
  doctorId: number;
  date: string;
  symptoms: string;
}
