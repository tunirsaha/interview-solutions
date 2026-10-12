import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { API_BASE } from '../config';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  
  // Use signals for reactive state
  private currentUserSignal = signal<User | null>(this.loadFromStorage());
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));

  // Computed signals
  public readonly currentUser = computed(() => {
    const token = this.tokenSignal();
    if (!token || !this.isTokenValid(token)) {
      return null;
    }
    return this.currentUserSignal();
  });

  public readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    return token ? this.isTokenValid(token) : false;
  });

  // Observable for components that need it
  public readonly userChanges$ = toObservable(this.currentUser);

  private isTokenValid(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
      const { exp } = JSON.parse(jsonPayload);
      return typeof exp === 'number' && exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private loadFromStorage(): User | null {
    const token = localStorage.getItem('token');
    if (!token || !this.isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    const json = localStorage.getItem('user');
    return json ? JSON.parse(json) : null;
  }

  private persist(user: User, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${API_BASE}/auth/login`, { email, password }).pipe(
      tap(({ token, user }) => this.persist(user, token))
    );
  }

  register(name: string, email: string, password: string, inviteToken: string) {
    return this.http.post<{ token: string; user: User }>(`${API_BASE}/auth/register`, { name, email, password, inviteToken }).pipe(
      tap(({ token, user }) => this.persist(user, token))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  get token() {
    return this.tokenSignal();
  }

  isLoggedIn() {
    return this.isAuthenticated();
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put<{ message: string }>(`${API_BASE}/auth/password`, { currentPassword, newPassword });
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSignal.set(token);
    
    if (this.isTokenValid(token)) {
      const json = localStorage.getItem('user');
      const user = json ? JSON.parse(json) : null;
      this.currentUserSignal.set(user);
    } else {
      this.logout();
    }
  }

  // Add method to validate current token and update state if needed
  validateAndUpdateState(): boolean {
    const token = this.token;
    if (!token || !this.isTokenValid(token)) {
      this.logout();
      return false;
    }
    return true;
  }
} 