import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password.page.html'
})
export class PasswordPage {
  current = '';
  new1 = '';
  new2 = '';

  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  submit() {
    if (!this.current || !this.new1 || this.new1 !== this.new2) {
      this.toast.error('Passwords do not match');
      return;
    }
    this.auth.changePassword(this.current, this.new1).subscribe({
      next: () => {
        this.toast.success('Password updated, please login again');
        this.auth.logout();
        this.router.navigateByUrl('/login');
      },
      error: err => this.toast.error(err.error?.message || 'Update failed')
    });
  }
} 