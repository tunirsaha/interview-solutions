import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { JobService, Job } from '../../services/job.service';
import { ListService, UserListWithJobs } from '../../services/list.service';
import { ListShareService } from '../../services/list-share.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { AuthService } from '../../services/auth.service';
import { formatDateTime } from '../../utils/date.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  private jobService = inject(JobService);
  private listService = inject(ListService);
  private listShareService = inject(ListShareService);
  private toastService = inject(ToastService);
  private confirmSvc = inject(ConfirmService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  userLists: UserListWithJobs[] = [];
  loading = false;
  expandedLists: Set<number> = new Set();
  
  // Sharing properties
  selectedList: UserListWithJobs | null = null;
  shareEmail = '';
  shareError = '';
  sharing = false;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadUserListsWithJobs();
    } else {
      this.toastService.error('Authentication required');
    }
  }

  loadUserListsWithJobs() {
    this.loading = true;

    this.listService
      .myListsWithJobs()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ lists }) => {
          this.userLists = lists || [];
          // Auto-expand the first list if there are any
          if (this.userLists.length > 0) {
            this.expandedLists.add(this.userLists[0].id);
          }
          
          const totalJobs = this.userLists.reduce((sum, list) => sum + list.jobs.length, 0);
          if (totalJobs > 0) {
            this.toastService.success(`Loaded ${totalJobs} job(s) from ${this.userLists.length} list(s)`);
          } else if (this.userLists.length > 0) {
            this.toastService.info('No jobs found in any lists');
          } else {
            this.toastService.info('No job lists found. Create a list first.');
          }
        },
        error: (err: any) => {
          console.error('Error loading user lists with jobs:', err);
          this.toastService.error('Failed to load user lists with jobs');
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

  goToJobs(listId: number) {
    this.router.navigate(['/jobs'], { queryParams: { list: listId } });
  }

  async remove(jobId: number) {
    const confirmed = await this.confirmSvc.confirmDelete('this job');
    if (!confirmed) return;
    
    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        this.toastService.info('Job deleted');
        // Remove the job from the local state
        this.userLists.forEach(list => {
          list.jobs = list.jobs.filter(job => job.id !== jobId);
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error deleting job:', err);
        this.toastService.error(err?.error?.message || 'Failed to delete job');
      }
    });
  }

  openJobLink(job: Job, event: Event) {
    if (job.apply_link) {
      event.stopPropagation();
      window.open(job.apply_link, '_blank');
    }
  }

  formatDate(dateString: string): string {
    return formatDateTime(dateString);
  }

  openShareModal(list: UserListWithJobs, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedList = list;
    this.shareEmail = '';
    this.shareError = '';
    this.sharing = false;
    
    // Show the modal using CSS
    const modal = document.getElementById('shareListModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
      
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modalBackdrop';
      document.body.appendChild(backdrop);
    }
  }

  shareList() {
    if (!this.selectedList || !this.shareEmail.trim()) {
      return;
    }

    this.sharing = true;
    this.shareError = '';

    this.listShareService.shareList(this.selectedList.id, this.shareEmail.trim())
      .subscribe({
        next: () => {
          this.toastService.success(`List "${this.selectedList!.title}" shared successfully with ${this.shareEmail}`);
          this.closeShareModal();
        },
        error: (err: any) => {
          console.error('Error sharing list:', err);
          this.shareError = err?.error?.error || 'Failed to share list';
          this.sharing = false;
          this.cdr.markForCheck();
        }
      });
  }

  closeShareModal() {
    this.selectedList = null;
    this.shareEmail = '';
    this.shareError = '';
    this.sharing = false;
    
    // Hide the modal using CSS
    const modal = document.getElementById('shareListModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      // Remove backdrop
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
} 