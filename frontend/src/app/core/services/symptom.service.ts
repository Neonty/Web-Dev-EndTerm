import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SymptomReport, SymptomResult } from '../models/smartmed.models';

@Injectable({ providedIn: 'root' })
export class SymptomService {
  constructor(private api: ApiService) {}

  analyze(symptoms_text: string, feeling_description: string) {
    return this.api.post<SymptomResult>('/symptoms/analyze/', { symptoms_text, feeling_description });
  }

  reports() {
    return this.api.get<SymptomReport[]>('/symptom-reports/');
  }
}
