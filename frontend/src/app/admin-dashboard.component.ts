import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { BookingApiService, BookingService, Reservation } from './booking-api.service';
import { BrandLogoComponent } from './brand-logo.component';

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  private readonly api = inject(BookingApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  services: BookingService[] = [];
  reservations: Reservation[] = [];
  filter: FilterStatus = 'ALL';
  search = '';
  confirmDeleteId: number | null = null;
  editingServiceId: number | null = null;
  message = '';
  loading = true;

  readonly serviceForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    durationMinutes: [30, [Validators.required, Validators.min(1)]]
  });

  constructor() { this.loadServices(); this.loadReservations(); }

  get user() { return this.auth.currentUser; }
  get pendingCount(): number { return this.reservations.filter(item => item.status === 'PENDING').length; }
  get confirmedCount(): number { return this.reservations.filter(item => item.status === 'CONFIRMED').length; }
  get cancelledCount(): number { return this.reservations.filter(item => item.status === 'CANCELLED').length; }
  get filteredReservations(): Reservation[] {
    const query = this.search.toLowerCase().trim();
    return this.reservations.filter(item => {
      const matchesStatus = this.filter === 'ALL' || item.status === this.filter;
      const matchesSearch = !query || `${item.customerName} ${item.customerEmail} ${item.service.name}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }

  statusLabel(status: string): string { return ({ PENDING: 'Pendiente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada' } as Record<string, string>)[status] ?? status; }
  setFilter(filter: FilterStatus): void { this.filter = filter; }
  updateStatus(reservation: Reservation, status: 'CONFIRMED' | 'CANCELLED'): void { this.api.updateReservationStatus(reservation.id, status).subscribe({ next: updated => { this.replaceReservation(updated); this.message = status === 'CONFIRMED' ? 'Reserva confirmada.' : 'Reserva rechazada.'; }, error: error => this.message = this.readError(error, 'No se pudo actualizar la reserva.') }); }
  askDelete(reservation: Reservation): void { this.confirmDeleteId = reservation.id; }
  deleteReservation(): void { if (!this.confirmDeleteId) return; this.api.deleteReservation(this.confirmDeleteId).subscribe({ next: () => { this.reservations = this.reservations.filter(item => item.id !== this.confirmDeleteId); this.confirmDeleteId = null; this.message = 'Reserva eliminada.'; }, error: error => { this.confirmDeleteId = null; this.message = this.readError(error, 'No se pudo eliminar la reserva.'); } }); }
  createService(): void {
    if (this.serviceForm.invalid) { this.serviceForm.markAllAsTouched(); return; }
    const request = this.serviceForm.getRawValue();
    const operation = this.editingServiceId === null
      ? this.api.createService(request)
      : this.api.updateService(this.editingServiceId, request);
    operation.subscribe({
      next: service => {
        this.services = this.editingServiceId === null
          ? [...this.services, service]
          : this.services.map(item => item.id === service.id ? service : item);
        this.editingServiceId = null;
        this.serviceForm.reset({ name: '', description: '', durationMinutes: 30 });
        this.message = 'Servicio guardado en el catálogo.';
      },
      error: error => this.message = this.readError(error, 'No se pudo guardar el servicio.')
    });
  }
  editService(service: BookingService): void {
    this.editingServiceId = service.id;
    this.serviceForm.setValue({ name: service.name, description: service.description, durationMinutes: service.durationMinutes });
    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
  }
  cancelEditService(): void {
    this.editingServiceId = null;
    this.serviceForm.reset({ name: '', description: '', durationMinutes: 30 });
  }
  deleteService(service: BookingService): void { this.api.deleteService(service.id).subscribe({ next: () => { this.services = this.services.filter(item => item.id !== service.id); this.message = 'Servicio eliminado del catálogo.'; }, error: error => this.message = this.readError(error, 'No se pudo eliminar el servicio.') }); }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/'); }
  private loadServices(): void { this.api.getServices().subscribe({ next: services => this.services = services }); }
  private loadReservations(): void { this.api.getAllReservations().subscribe({ next: reservations => { this.reservations = reservations; this.loading = false; }, error: error => { this.loading = false; this.message = this.readError(error, 'No se pudieron cargar las reservas.'); } }); }
  private replaceReservation(updated: Reservation): void { this.reservations = this.reservations.map(item => item.id === updated.id ? updated : item); }
  private readError(error: HttpErrorResponse, fallback: string): string { return error.error?.message ?? error.error?.detail ?? fallback; }
}
