import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../config';

export interface JobList {
  id: number;
  title: string;
  public: boolean;
  created_at: string;
}

export interface PublicListWithJobs {
  id: number;
  title: string;
  created_at: string;
  creator_name: string;
  jobs: Job[];
}

export interface UserListWithJobs {
  id: number;
  title: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  creator_name: string;
  jobs: Job[];
}

export interface SharedListWithJobs {
  id: number;
  title: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  creator_name: string;
  share_id: number;
  share_created_at: string;
  shared_by_user_id: number;
  jobs: Job[];
}

export interface Job {
  id: number;
  title: string;
  apply_link?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ListService {
  private http = inject(HttpClient);

  create(data: { title: string; public: boolean }) {
    return this.http.post<JobList>(`${API_BASE}/lists`, data);
  }

  myLists() {
    return this.http.get<{ lists: JobList[] }>(`${API_BASE}/lists`);
  }

  myListsWithJobs() {
    return this.http.get<{ lists: UserListWithJobs[] }>(`${API_BASE}/lists/with-jobs`);
  }

  getSharedListsWithJobs() {
    return this.http.get<{ lists: SharedListWithJobs[] }>(`${API_BASE}/lists/shared-with-jobs`);
  }

  getPublicLists() {
    return this.http.get<{ lists: PublicListWithJobs[] }>(`${API_BASE}/lists/public`);
  }

  update(id: number, data: { title: string; public: boolean }) {
    return this.http.put<JobList>(`${API_BASE}/lists/${id}`, data);
  }

  remove(id: number) {
    return this.http.delete<{ success: boolean }>(`${API_BASE}/lists/${id}`);
  }
} 