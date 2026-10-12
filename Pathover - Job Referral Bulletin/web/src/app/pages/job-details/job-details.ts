import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { JobService, Job } from '../../services/job.service';
import { ToastService } from '../../services/toast.service';
import { formatDateTime } from '../../utils/date.util';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.html',
  styleUrl: './job-details.scss'
})
export class JobDetailsPage implements OnInit {
  private jobService = inject(JobService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  job?: Job;
  loading = true;

  ngOnInit() {
    const jobId = this.route.snapshot.params['id'];
    if (jobId) {
      this.loadJob(jobId);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadJob(id: number) {
    this.loading = true;
    this.jobService.getJobById(id).subscribe({
      next: (job: Job) => {
        this.job = job;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading job:', err);
        this.toastService.error('Failed to load job details');
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  formatDate(dateString: string): string {
    return formatDateTime(dateString);
  }

  goBack() {
    this.router.navigate(['/']);
  }
} 