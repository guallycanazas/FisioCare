import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LandingPageComponent } from './landing-page.component';
import { AuthPageComponent } from './auth-page.component';
import { BookingPageComponent } from './booking-page.component';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { OAuthCallbackComponent } from './oauth-callback.component';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: '/mi-cuenta' } });
};

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser?.role === 'ADMIN' ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: AuthPageComponent, data: { mode: 'login' } },
  { path: 'registro', component: AuthPageComponent, data: { mode: 'register' } },
  { path: 'oauth2/callback', component: OAuthCallbackComponent },
  { path: 'reservar', component: BookingPageComponent },
  { path: 'mi-cuenta', component: CustomerDashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
