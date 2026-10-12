import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../config';

export interface Invite {
  id: number;
  email: string;
  token: string;
  created_at: string;
  accepted_at: string | null;
  accepted: boolean;
}

@Injectable({ providedIn: 'root' })
export class InviteService {
  private http = inject(HttpClient);

  create(data: { email: string }) {
    return this.http.post<{ token: string; registerLink: string }>(`${API_BASE}/invites`, data);
  }

  list() {
    return this.http.get<{ invites: Invite[] }>(`${API_BASE}/invites`);
  }

  delete(id: number) {
    return this.http.delete(`${API_BASE}/invites/${id}`);
  }
} 