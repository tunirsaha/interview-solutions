import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/']);
}; 