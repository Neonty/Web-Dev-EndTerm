import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly storageKey = 'smartmed_lang';
  readonly languages = ['kk', 'ru', 'en'];

  constructor(private translate: TranslateService) {
    this.translate.addLangs(this.languages);
    this.translate.setDefaultLang('kk');
    const lang = localStorage.getItem(this.storageKey) || 'kk';
    this.translate.use(this.languages.includes(lang) ? lang : 'kk');
  }

  get currentLang(): string {
    return this.translate.currentLang || 'kk';
  }

  setLanguage(lang: string): void {
    const nextLang = this.languages.includes(lang) ? lang : 'kk';
    localStorage.setItem(this.storageKey, nextLang);
    this.translate.use(nextLang);
  }
}
