import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BookingService {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  active: boolean;
}

export interface ReservationRequest {
  startsAt: string;
  serviceId: number;
}

export interface Reservation {
  id: number;
  customerName: string;
  customerEmail: string;
  startsAt: string;
  status: string;
  service: Pick<BookingService, 'id' | 'name' | 'durationMinutes'>;
}

export interface AuthProviders {
  google: boolean;
}

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8081/api';

  getAuthProviders(): Observable<AuthProviders> {
    return this.http.get<AuthProviders>(`${this.apiUrl}/auth/providers`);
  }

  getServices(): Observable<BookingService[]> {
    return this.http.get<BookingService[]>(`${this.apiUrl}/services`);
  }

  createReservation(request: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, request);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/mine`);
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`);
  }

  updateReservationStatus(id: number, status: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/status`, { status });
  }

  updateReservation(id: number, request: ReservationRequest): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/reservations/${id}`, request);
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/cancel`, {});
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${id}`);
  }

  createService(request: Omit<BookingService, 'id' | 'active'>): Observable<BookingService> {
    return this.http.post<BookingService>(`${this.apiUrl}/services`, request);
  }

  updateService(id: number, request: Omit<BookingService, 'id' | 'active'>): Observable<BookingService> {
    return this.http.put<BookingService>(`${this.apiUrl}/services/${id}`, request);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/services/${id}`);
  }
}
