import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-symptoms',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './symptoms.component.html',
  styleUrls: ['./symptoms.component.css']
})
export class SymptomsComponent {
  selectedSymptoms: string[] = [];
  additionalText = '';
  startDate = new Date().toISOString().split('T')[0];
  severity = 'Лёгкая';
  showError = false;

  allSymptoms = [
    'Болит горло',
    'Температура',
    'Кашель',
    'Насморк',
    'Головная боль',
    'Слабость',
    'Боль в животе',
    'Аллергия',
  ];

  constructor(private router: Router) {}

  toggleSymptom(symptom: string) {
    const idx = this.selectedSymptoms.indexOf(symptom);
    if (idx === -1) {
      this.selectedSymptoms.push(symptom);
    } else {
      this.selectedSymptoms.splice(idx, 1);
    }
    this.showError = false;
  }

  isSelected(symptom: string): boolean {
    return this.selectedSymptoms.includes(symptom);
  }

  onAnalyze() {
    if (this.selectedSymptoms.length === 0 && !this.additionalText.trim()) {
      this.showError = true;
      return;
    }
    this.router.navigate(['/results'], {
      state: {
        symptoms: this.selectedSymptoms,
        text: this.additionalText,
        severity: this.severity,
      },
    });
  }
}
