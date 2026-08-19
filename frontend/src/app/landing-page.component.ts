import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingApiService, BookingService } from './booking-api.service';
import { BrandLogoComponent } from './brand-logo.component';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BrandLogoComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  private readonly api = inject(BookingApiService);
  readonly auth = inject(AuthService);
  services: BookingService[] = [];

  constructor() {
    this.api.getServices().subscribe({ next: services => this.services = services });
  }
}
