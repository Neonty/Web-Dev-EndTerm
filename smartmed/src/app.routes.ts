import { Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { SymptomsComponent } from './app/components/symptoms/symptoms.component';
import { ResultsComponent } from './app/components/results/results.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'symptoms', component: SymptomsComponent },
  { path: 'results', component: ResultsComponent },
];