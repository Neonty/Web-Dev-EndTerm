import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  isLoading = false;

  constructor(private apiService: ApiService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Заполните все поля';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/symptoms']);
      },
      error: () => {
        this.errorMessage = 'Неверный email или пароль';
        this.isLoading = false;
      }
    });
  }
}
