import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="brand-logo" routerLink="/" aria-label="FisioCare, ir al inicio">
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <path d="M22 5.5c3.2 7.9 5.4 10.2 13.3 13.4-7.9 3.2-10.1 5.5-13.3 13.4-3.2-7.9-5.4-10.2-13.3-13.4C16.6 15.7 18.8 13.4 22 5.5Z" fill="currentColor"/>
        <path d="M22 13.5c1.4 3.2 2.5 4.3 5.7 5.8-3.2 1.4-4.3 2.5-5.7 5.8-1.4-3.2-2.5-4.3-5.7-5.8 3.2-1.4 4.3-2.5 5.7-5.8Z" fill="white" opacity=".9"/>
      </svg>
      <span>FisioCare</span>
    </a>
  `,
  styles: [`
    :host { display: inline-block; }
    .brand-logo { display: inline-flex; align-items: center; gap: .65rem; color: #26245f; font-size: 1.15rem; font-weight: 900; letter-spacing: -.045em; text-decoration: none; }
    svg { width: 2.35rem; height: 2.35rem; padding: .45rem; border-radius: .8rem; background: #deddff; color: #5c58d8; }
    .brand-logo span { white-space: nowrap; }
  `]
})
export class BrandLogoComponent {
  @Input() compact = false;
}
