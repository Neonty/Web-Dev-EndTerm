import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  firstName = '';
  lastName = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private apiService: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  onRegister(): void {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Логин және пароль өрістерін толтырыңыз';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Парольдер сәйкес емес';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.register({
      username: this.username.trim(),
      email: this.email.trim(),
      first_name: this.firstName.trim(),
      last_name: this.lastName.trim(),
      password: this.password,
      password_confirm: this.confirmPassword
    }).subscribe({
      next: () => {
        this.successMessage = 'Тіркелу сәтті аяқталды. Енді жүйеге кіріңіз.';
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: (err) => {
        const data = err?.error;
        if (typeof data === 'string') {
          this.errorMessage = data;
        } else if (data?.username?.[0]) {
          this.errorMessage = `Логин: ${data.username[0]}`;
        } else if (data?.password?.[0]) {
          this.errorMessage = `Пароль: ${data.password[0]}`;
        } else if (data?.password_confirm?.[0]) {
          this.errorMessage = `Қайта пароль: ${data.password_confirm[0]}`;
        } else {
          this.errorMessage = 'Тіркелу кезінде қате пайда болды';
        }
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }
}
