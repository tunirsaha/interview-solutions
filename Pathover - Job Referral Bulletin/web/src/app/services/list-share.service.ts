import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

export interface ListShare {
  id: number;
  list_id: number;
  shared_by_user_id: number;
  shared_with_user_id: number;
  created_at: string;
  list_name?: string;
  list_description?: string;
  shared_by_email?: string;
  shared_with_email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ListShareService {
  private apiUrl = `${API_BASE}/list-shares`;

  constructor(private http: HttpClient) {}

  shareList(listId: number, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${listId}/share`, { email });
  }

  getSharedLists(): Observable<ListShare[]> {
    return this.http.get<ListShare[]>(`${this.apiUrl}/shared-with-me`);
  }

  getListShares(listId: number): Observable<ListShare[]> {
    return this.http.get<ListShare[]>(`${this.apiUrl}/${listId}/shares`);
  }

  removeShare(listId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${listId}/share/${userId}`);
  }
} 