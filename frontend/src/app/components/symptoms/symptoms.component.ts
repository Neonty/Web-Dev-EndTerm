import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SYMPTOM_OPTIONS, SymptomCode } from '../../../services/symptom-keywords';
import { ApiService } from '../../../services/api.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-symptoms',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslatePipe],
  templateUrl: './symptoms.component.html',
  styleUrls: ['./symptoms.component.css']
})
export class SymptomsComponent {
  selectedSymptoms: SymptomCode[] = [];
  additionalText = '';
  startDate = new Date().toISOString().split('T')[0];
  severity = 'Лёгкая';
  showError = false;
  aiLoading = false;
  aiError = '';
  aiAdvice = '';

  allSymptoms = SYMPTOM_OPTIONS;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService
  ) {}

  toggleSymptom(code: SymptomCode) {
    const idx = this.selectedSymptoms.indexOf(code);
    if (idx === -1) {
      this.selectedSymptoms.push(code);
    } else {
      this.selectedSymptoms.splice(idx, 1);
    }
    this.showError = false;
  }

  isSelected(code: SymptomCode): boolean {
    return this.selectedSymptoms.includes(code);
  }

  onAnalyze() {
  if (this.selectedSymptoms.length === 0 && !this.additionalText.trim()) {
    this.showError = true;
    return;
  }

  this.router.navigate(['/results'], {
    queryParams: {
      codes:     this.selectedSymptoms.join(','),
      text:      this.additionalText,
      severity:  this.severity,
      startDate: this.startDate,
    }
  });
  }

  getAiAdvice(): void {
    if (this.selectedSymptoms.length === 0 && !this.additionalText.trim()) {
      this.showError = true;
      return;
    }

    this.aiLoading = true;
    this.aiError = '';
    this.aiAdvice = '';

    this.apiService
      .aiSymptomAdvice({
        symptomCodes: this.selectedSymptoms,
        text: this.additionalText,
        severity: this.severity,
        startDate: this.startDate,
        lang: (this.languageService.currentLang as 'kk' | 'ru' | 'en') ?? 'kk',
      })
      .subscribe({
        next: (res) => {
          this.aiAdvice = res?.advice ?? '';
          this.aiLoading = false;
        },
        error: () => {
          this.aiError = 'ИИ кеңесін алу мүмкін болмады';
          this.aiLoading = false;
        },
      });
  }
}
