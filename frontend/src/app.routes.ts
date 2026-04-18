import { Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { SymptomsComponent } from './app/components/symptoms/symptoms.component';
import { ResultsComponent } from './app/components/results/results.component';
import { RegisterComponent } from './app/components/register/register.component';
import { ProfileComponent } from './app/components/profile/profile.component';
import { authGuard } from './app/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'symptoms', component: SymptomsComponent, canActivate: [authGuard] },
  { path: 'results', component: ResultsComponent, canActivate: [authGuard] },
];