import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { routes } from '../app.routes';

class JsonTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get<any>(`/assets/i18n/${lang}.json`);
  }
}

export function httpLoaderFactory(http: HttpClient): TranslateLoader {
  return new JsonTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};