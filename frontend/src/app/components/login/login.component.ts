import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Заполните все поля';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res?.access) {
          this.authService.setTokens(res.access, res?.refresh);
        }
        this.authService.refreshProfileFromApi();
        this.router.navigate(['/symptoms']);
      },
      error: () => {
        this.errorMessage = 'Неверный логин или пароль';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
