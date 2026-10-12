import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../config';
import { switchMap, tap, debounceTime, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Track last refresh time to prevent duplicate calls
let lastRefreshTime = 0;
const REFRESH_DEBOUNCE_MS = 1000; // 1 second debounce

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);
  const router = inject(Router);
  const token = auth.token;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  // Only refresh for API requests and not for auth endpoints
  const isApiRequest = req.url.includes('localhost:4000') || req.url.startsWith('http://localhost:4000');
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh');

  return next(req).pipe(
    switchMap(res => {
      if (token && isApiRequest && !isAuthEndpoint) {
        const now = Date.now();
        if (now - lastRefreshTime > REFRESH_DEBOUNCE_MS) {
          lastRefreshTime = now;
          // Call refresh in the background
          return http.post<{ token: string }>(`${API_BASE}/auth/refresh`, {}).pipe(
            tap(({ token: newToken }) => {
              if (newToken) {
                localStorage.setItem('token', newToken);
                auth.setToken(newToken);
              }
            }),
            catchError(error => {
              auth.logout();
              router.navigateByUrl('/', { replaceUrl: true });
              return of(res);
            }),
            switchMap(() => of(res))
          );
        } else {

        }
      }
      return of(res);
    }),
    catchError(error => {
      // Handle 401 errors by logging out the user
      if (error.status === 401 && token) {
        auth.logout();
        router.navigateByUrl('/', { replaceUrl: true });
      }
      return throwError(() => error);
    })
  );
}; 