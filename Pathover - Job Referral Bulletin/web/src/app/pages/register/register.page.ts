import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { RouterModule } from '@angular/router';

interface InviteData {
  token: string;
  email: string;
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.page.html'
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  inviteToken = '';
  inviteTokenPrefilled = false;
  emailPrefilled = false;

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const encodedData = params.get('inviteToken');
      if (encodedData) {
        try {
          const decodedData = JSON.parse(atob(decodeURIComponent(encodedData))) as InviteData;
          this.inviteToken = decodedData.token;
          this.email = decodedData.email;
          this.inviteTokenPrefilled = true;
          this.emailPrefilled = true;
        } catch (error) {
          console.error('Failed to decode invite data:', error);
          this.toast.error('Invalid invitation link');
        }
      }
    });
  }

  register() {
    this.auth.register(this.name, this.email, this.password, this.inviteToken).subscribe({
      next: () => {
        this.toast.success('Account created');
        this.router.navigateByUrl('/dashboard');
      },
      error: err => this.toast.error(err.error?.message || 'Registration failed')
    });
  }
} 