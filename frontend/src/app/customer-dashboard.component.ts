import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { BookingApiService, Reservation } from './booking-api.service';
import { BrandLogoComponent } from './brand-logo.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BrandLogoComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css'
})
export class CustomerDashboardComponent {
  private readonly api = inject(BookingApiService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  reservations: Reservation[] = [];
  loading = true;
  message = '';
  confirmCancelId: number | null = null;

  constructor() { this.loadReservations(); }

  get user() { return this.auth.currentUser; }
  get pendingCount(): number { return this.reservations.filter(item => item.status === 'PENDING').length; }
  get confirmedCount(): number { return this.reservations.filter(item => item.status === 'CONFIRMED').length; }
  get nextReservation(): Reservation | undefined {
    return this.reservations.filter(item => item.status !== 'CANCELLED' && new Date(item.startsAt) >= new Date()).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
  }

  statusLabel(status: string): string { return ({ PENDING: 'Pendiente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada' } as Record<string, string>)[status] ?? status; }
  statusNote(status: string): string { return status === 'CONFIRMED' ? 'Tu sesión está confirmada.' : status === 'CANCELLED' ? 'Esta reserva fue cancelada.' : 'Estamos revisando tu solicitud.'; }

  askCancel(reservation: Reservation): void { this.confirmCancelId = reservation.id; }
  cancel(): void {
    if (!this.confirmCancelId) return;
    this.api.cancelReservation(this.confirmCancelId).subscribe({
      next: () => { this.confirmCancelId = null; this.message = 'Reserva cancelada correctamente.'; this.loadReservations(); },
      error: error => { this.confirmCancelId = null; this.message = this.readError(error, 'No se pudo cancelar la reserva.'); }
    });
  }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/'); }
  private loadReservations(): void { this.api.getMyReservations().subscribe({ next: reservations => { this.reservations = reservations; this.loading = false; }, error: error => { this.loading = false; this.message = this.readError(error, 'No se pudieron cargar tus reservas.'); } }); }
  private readError(error: HttpErrorResponse, fallback: string): string { return error.error?.message ?? error.error?.detail ?? fallback; }
}
