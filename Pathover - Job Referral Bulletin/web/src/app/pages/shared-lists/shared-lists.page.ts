import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ListService, SharedListWithJobs } from '../../services/list.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { formatDateTime } from '../../utils/date.util';

@Component({
  selector: 'app-shared-lists-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-lists.page.html'
})
export class SharedListsPage implements OnInit {
  private listService = inject(ListService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  sharedLists: SharedListWithJobs[] = [];
  loading = false;
  expandedLists: Set<number> = new Set();

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadSharedLists();
    } else {
      this.toastService.error('Authentication required');
    }
  }

  loadSharedLists() {
    this.loading = true;

    this.listService.getSharedListsWithJobs()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ lists }) => {
          this.sharedLists = lists || [];
          // Auto-expand the first list if there are any
          if (this.sharedLists.length > 0) {
            this.expandedLists.add(this.sharedLists[0].id);
          }
          
          const totalJobs = this.sharedLists.reduce((sum, list) => sum + list.jobs.length, 0);
          if (totalJobs > 0) {
            this.toastService.success(`Loaded ${totalJobs} job(s) from ${this.sharedLists.length} shared list(s)`);
          } else if (this.sharedLists.length > 0) {
            this.toastService.info('No jobs found in shared lists');
          } else {
            this.toastService.info('No lists have been shared with you yet');
          }
        },
        error: (err: any) => {
          console.error('Error loading shared lists:', err);
          this.toastService.error('Failed to load shared lists');
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

  openJobLink(job: any, event: Event) {
    if (job.apply_link) {
      event.stopPropagation();
      window.open(job.apply_link, '_blank');
    }
  }

  formatDate(dateString: string): string {
    return formatDateTime(dateString);
  }
} 