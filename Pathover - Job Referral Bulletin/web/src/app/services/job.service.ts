import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

export interface Job {
  id: number;
  title: string;
  apply_link?: string;
  job_list_id?: number;
  list_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  title: string;
  apply_link?: string;
  job_list_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);

  getPublicJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${API_BASE}/jobs/public`);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${API_BASE}/jobs/${id}`);
  }

  createJob(jobData: CreateJobData): Observable<Job> {
    return this.http.post<Job>(`${API_BASE}/jobs`, jobData);
  }

  updateJob(id: number, jobData: Partial<CreateJobData>): Observable<Job> {
    return this.http.put<Job>(`${API_BASE}/jobs/${id}`, jobData);
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${API_BASE}/jobs/${id}`);
  }

  getJobsByList(jobListId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${API_BASE}/jobs/list/${jobListId}`);
  }
} 