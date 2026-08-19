import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { BrandLogoComponent } from './brand-logo.component';
import { BookingApiService } from './booking-api.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly api = inject(BookingApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly mode: AuthMode;
  readonly returnUrl: string;
  message = '';
  submitting = false;
  googleEnabled = false;

  readonly form = this.formBuilder.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'login') as AuthMode;
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
    if (this.route.snapshot.queryParamMap.has('oauthError')) {
      this.message = 'No se pudo completar el acceso con Google. Inténtalo nuevamente.';
    }
    this.api.getAuthProviders().subscribe({ next: providers => this.googleEnabled = providers.google });
  }

  get isRegister(): boolean { return this.mode === 'register'; }

  submit(): void {
    const name = this.form.controls.name.value.trim();
    if (this.form.invalid || (this.isRegister && !name)) {
      this.form.markAllAsTouched();
      this.message = 'Completa los datos para continuar.';
      return;
    }
    this.submitting = true;
    const value = this.form.getRawValue();
    const request = this.isRegister
      ? this.auth.register(name, value.email, value.password)
      : this.auth.login(value.email, value.password);
    request.subscribe({
      next: response => {
        this.submitting = false;
        const destination = this.returnUrl || (response.user.role === 'ADMIN' ? '/admin' : '/mi-cuenta');
        this.router.navigateByUrl(destination);
      },
      error: error => {
        this.submitting = false;
        this.message = this.readError(error, 'No pudimos validar tus datos. Revisa tu correo y contraseña.');
      }
    });
  }

  private readError(error: HttpErrorResponse, fallback: string): string {
    return error.error?.message ?? error.error?.detail ?? fallback;
  }
}
