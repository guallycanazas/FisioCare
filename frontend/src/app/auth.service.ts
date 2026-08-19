import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';
  private readonly userSubject = new BehaviorSubject<User | null>(this.readUser());
  readonly user$ = this.userSubject.asObservable();

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('reservas_token');
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(response => this.store(response)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(tap(response => this.store(response)));
  }

  logout(): void {
    localStorage.removeItem('reservas_token');
    localStorage.removeItem('reservas_user');
    this.userSubject.next(null);
  }

  completeExternalLogin(token: string, user: User): void {
    this.store({ token, user });
  }

  private store(response: AuthResponse): void {
    localStorage.setItem('reservas_token', response.token);
    localStorage.setItem('reservas_user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private readUser(): User | null {
    try {
      const stored = localStorage.getItem('reservas_user');
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  }
}
