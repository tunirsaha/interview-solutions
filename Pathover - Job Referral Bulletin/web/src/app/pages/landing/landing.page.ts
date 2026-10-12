import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ListService, PublicListWithJobs } from '../../services/list.service';
import { ToastService } from '../../services/toast.service';
import { formatDate } from '../../utils/date.util';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.page.html'
})
export class LandingPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private listService = inject(ListService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  publicLists: PublicListWithJobs[] = [];
  loading = false;
  expandedLists: Set<number> = new Set();

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } else {
      this.loadPublicLists();
    }
  }

  loadPublicLists() {
    this.loading = true;

    this.listService
      .getPublicLists()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ lists }) => {
          this.publicLists = lists || [];
          // Auto-expand the first list if there are any
          if (this.publicLists.length > 0) {
            this.expandedLists.add(this.publicLists[0].id);
          }
        },
        error: (err: any) => {
          console.error('Error loading public lists:', err);
          this.toastService.error('Failed to load public lists');
        }
      });
  }

  toggleList(listId: number) {
    if (this.expandedLists.has(listId)) {
      this.expandedLists.delete(listId);
    } else {
      this.expandedLists.add(listId);
    }
  }

  isListExpanded(listId: number): boolean {
    return this.expandedLists.has(listId);
  }

  formatDate(dateString: string): string {
    return formatDate(dateString);
  }

  openJobLink(job: any, event: Event) {
    if (job.apply_link) {
      event.stopPropagation();
      window.open(job.apply_link, '_blank');
    }
  }
} 