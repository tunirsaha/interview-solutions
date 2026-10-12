import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  email = '';
  password = '';

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.toast.success('Logged in');
        this.router.navigateByUrl('/dashboard');
      },
      error: err => this.toast.error(err.error?.message || 'Login failed')
    });
  }
} 