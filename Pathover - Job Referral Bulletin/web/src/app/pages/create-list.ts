import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListService } from '../services/list.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-list.html'
})
export class CreateListPage {
  title = '';
  isPublic = false;

  private listSvc = inject(ListService);
  private toast = inject(ToastService);
  private router = inject(Router);

  submit() {
    if (!this.title) return;
    this.listSvc.create({ title: this.title, public: this.isPublic }).subscribe({
      next: () => {
        this.toast.success('List created');
        this.router.navigateByUrl('/dashboard');
      },
      error: err => this.toast.error(err.error?.message || 'Failed')
    });
  }
}
