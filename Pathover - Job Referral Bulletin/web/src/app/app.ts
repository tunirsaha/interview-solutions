import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';
import { ConfirmModalComponent } from './components/confirm-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule, ConfirmModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  logout() {
    this.auth.logout();
    this.toast.info('Logged out');
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
