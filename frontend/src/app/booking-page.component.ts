import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { BookingApiService, BookingService } from './booking-api.service';
import { BrandLogoComponent } from './brand-logo.component';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.css'
})
export class BookingPageComponent {
  private readonly api = inject(BookingApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  services: BookingService[] = [];
  loading = true;
  message = '';
  success = false;
  minDateTime = this.toLocalDateTimeValue(new Date());

  readonly form = this.formBuilder.nonNullable.group({
    serviceId: [0, [Validators.required, Validators.min(1)]],
    startsAt: ['', Validators.required]
  });

  constructor() {
    this.api.getServices().subscribe({
      next: services => { this.services = services; this.loading = false; },
      error: error => { this.loading = false; this.message = this.readError(error, 'No pudimos cargar los servicios.'); }
    });
  }

  get user() { return this.auth.currentUser; }
  get selectedService(): BookingService | undefined { return this.services.find(service => service.id === this.form.controls.serviceId.value); }

  chooseService(service: BookingService): void { this.form.controls.serviceId.setValue(service.id); }

  submit(): void {
    if (!this.user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/reservar' } });
      return;
    }
    if (this.form.invalid) { this.form.markAllAsTouched(); this.message = 'Selecciona un servicio y un horario.'; return; }
    this.api.createReservation(this.form.getRawValue()).subscribe({
      next: () => { this.success = true; this.message = ''; },
      error: error => this.message = this.readError(error, 'No se pudo registrar la reserva.')
    });
  }

  logout(): void { this.auth.logout(); this.router.navigateByUrl('/'); }

  private readError(error: HttpErrorResponse, fallback: string): string { return error.error?.message ?? error.error?.detail ?? fallback; }
  private toLocalDateTimeValue(date: Date): string { const pad = (value: number) => String(value).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
}
