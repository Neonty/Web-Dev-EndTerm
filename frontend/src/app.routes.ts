import { Routes } from '@angular/router';
import { LoginComponent } from './app/components/login/login.component';
import { SymptomsComponent } from './app/components/symptoms/symptoms.component';
import { ResultsComponent } from './app/components/results/results.component';
import { RegisterComponent } from './app/components/register/register.component';
import { ProfileComponent } from './app/components/profile/profile.component';
import { CartComponent } from './app/components/cart/cart.component';
import { CheckoutComponent } from './app/components/checkout/checkout.component';
import { OrdersComponent } from './app/components/orders/orders.component';
import { authGuard } from './app/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile',  component: ProfileComponent,  canActivate: [authGuard] },
  { path: 'symptoms', component: SymptomsComponent, canActivate: [authGuard] },
  { path: 'results',  component: ResultsComponent,  canActivate: [authGuard] },
  { path: 'cart',     component: CartComponent,     canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders',   component: OrdersComponent,   canActivate: [authGuard] },
];