import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingPage) },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'invites',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/invite/invite.page').then(m => m.InvitePage)
  },
  {
    path: 'password',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/password/password.page').then(m => m.PasswordPage)
  },
  {
    path: 'create-list',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/create-list').then(m => m.CreateListPage)
  },
  {
    path: 'my-lists',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/lists.page').then(m=>m.ListsPage)
  },
  {
    path: 'shared-lists',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/shared-lists/shared-lists.page').then(m => m.SharedListsPage)
  },
  {
    path: 'jobs',
    canMatch: [authGuard],
    loadComponent: () => import('./pages/jobs/jobs').then(m => m.JobsPage)
  },
  {
    path: 'job/:id',
    loadComponent: () => import('./pages/job-details/job-details').then(m => m.JobDetailsPage)
  },
  { path: '**', redirectTo: '' }
]; 
