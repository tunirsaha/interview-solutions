import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { JobService, Job, CreateJobData } from '../../services/job.service';
import { ListService, JobList } from '../../services/list.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { formatDateTime } from '../../utils/date.util';

interface EditableJob extends Job {
  editing?: boolean;
  editTitle?: string;
  editApplyLink?: string;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss'
})
export class JobsPage implements OnInit {
  private jobService = inject(JobService);
  private listService = inject(ListService);
  private toastService = inject(ToastService);
  private confirmSvc = inject(ConfirmService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  jobLists: JobList[] = [];
  jobs: EditableJob[] = [];
  selectedListId: number = 0;
  loading = false;
  hasLists = false;

  // Form data for new job
  newTitle = '';
  newApplyLink = '';

  ngOnInit() {
    this.loadJobLists();
  }

  loadJobLists() {
    this.listService.myLists().subscribe({
      next: ({ lists }: { lists: JobList[] }) => {
        this.jobLists = lists || [];
        this.hasLists = this.jobLists.length > 0;
        
        if (this.hasLists) {
          // Check for list query parameter
          this.route.queryParams.subscribe(params => {
            const listParam = params['list'];
            if (listParam) {
              const listId = parseInt(listParam, 10);
              const listExists = this.jobLists.find(list => list.id === listId);
              if (listExists) {
                this.selectedListId = listId;
              } else {
                this.selectedListId = this.jobLists[0].id;
                this.toastService.info(`List with ID ${listId} not found, showing first available list`);
              }
            } else {
              this.selectedListId = this.jobLists[0].id;
            }
            this.loadJobs();
          });
        } else {
          this.toastService.info('No job lists found. Create a list first.');
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading job lists:', err);
        this.toastService.error('Failed to load job lists');
        this.hasLists = false;
        this.cdr.markForCheck();
      }
    });
  }

  onListChange() {
    this.loadJobs();
  }

  loadJobs() {
    if (!this.selectedListId) return;
    
    this.loading = true;
    this.jobService.getJobsByList(this.selectedListId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (jobs) => {
          this.jobs = jobs || [];
        },
        error: (err) => {
          console.error('Error loading jobs:', err);
          this.toastService.error('Failed to load jobs');
        }
      });
  }

  create() {
    if (!this.newTitle.trim()) {
      this.toastService.error('Job title is required');
      return;
    }

    const jobData: CreateJobData = {
      title: this.newTitle.trim(),
      apply_link: this.newApplyLink.trim() || undefined,
      job_list_id: this.selectedListId
    };

    this.jobService.createJob(jobData).subscribe({
      next: (newJob) => {
        this.toastService.success(`"${newJob.title}" added to jobs`);
        this.newTitle = '';
        this.newApplyLink = '';
        // Add the new job to local array and trigger change detection
        this.jobs = [...this.jobs, newJob];
        this.cdr.markForCheck();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Failed to create job')
    });
  }

  enableEdit(job: EditableJob) {
    job.editing = true;
    job.editTitle = job.title;
    job.editApplyLink = job.apply_link || '';
  }

  save(job: EditableJob) {
    if (!job.editTitle?.trim()) {
      this.toastService.error('Job title is required');
      return;
    }

    const updateData = {
      title: job.editTitle.trim(),
      apply_link: job.editApplyLink?.trim() || undefined
    };

    this.jobService.updateJob(job.id, updateData).subscribe({
      next: (updatedJob) => {
        // Update the local state with server response and exit editing mode
        Object.assign(job, updatedJob, { editing: false });
        // Clear edit fields
        delete job.editTitle;
        delete job.editApplyLink;
        this.toastService.success('Job updated');
        this.cdr.markForCheck();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Failed to update job')
    });
  }

  cancel(job: EditableJob) {
    job.editing = false;
    delete job.editTitle;
    delete job.editApplyLink;
  }

  async remove(job: EditableJob) {
    const confirmed = await this.confirmSvc.confirmDelete(`"${job.title}"`);
    if (!confirmed) return;
    
    this.jobService.deleteJob(job.id).subscribe({
      next: () => {
        this.toastService.info('Job deleted');
        // Remove the item from local list and trigger change detection
        this.jobs = this.jobs.filter(j => j.id !== job.id);
        this.cdr.markForCheck();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Failed to delete job')
    });
  }

  formatDate(dateString: string): string {
    return formatDateTime(dateString);
  }
} 