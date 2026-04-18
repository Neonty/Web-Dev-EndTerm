import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService, UserProfile } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    about: '',
    avatar: ''
  };

  isLoading = false;
  isSaving = false;
  message = '';
  error = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.authService.isAuthenticated()) {
      this.error = 'Алдымен жүйеге кіріңіз';
      return;
    }

    this.isLoading = true;
    this.apiService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = { ...this.profile, ...data };
        this.authService.saveLocalProfile(this.profile);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Профиль деректерін жүктеу мүмкін болмады';
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    this.isSaving = true;
    this.error = '';
    this.message = '';
    this.apiService.updateMyProfile(this.profile).subscribe({
      next: (data) => {
        this.profile = { ...this.profile, ...data };
        this.authService.saveLocalProfile(this.profile);
        this.message = 'Сақталды';
        this.isSaving = false;
      },
      error: () => {
        this.error = 'Сақтау кезінде қате пайда болды';
        this.isSaving = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profile.avatar = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }
}
