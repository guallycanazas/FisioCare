import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="brand-logo" routerLink="/" aria-label="FisioCare, ir al inicio">
      <img src="/assets/fisiocare-logo.png" alt="" aria-hidden="true" />
      <span>FisioCare</span>
    </a>
  `,
  styles: [`
    :host { display: inline-block; }
    .brand-logo { display: inline-flex; align-items: center; gap: .65rem; color: #26245f; font-size: 1.15rem; font-weight: 900; letter-spacing: -.045em; text-decoration: none; }
    img { width: 2.65rem; height: 2.65rem; object-fit: contain; border-radius: .8rem; background: #deddff; }
    .brand-logo span { white-space: nowrap; }
  `]
})
export class BrandLogoComponent {
  @Input() compact = false;
}
