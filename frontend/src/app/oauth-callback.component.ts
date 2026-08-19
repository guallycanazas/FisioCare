import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `<main class="oauth-callback"><div class="loader"></div><h1>Terminando tu acceso…</h1><p>Te estamos llevando a FisioCare.</p></main>`,
  styles: [`
    :host { display:block; min-height:100vh; }
    .oauth-callback { display:grid; place-items:center; align-content:center; min-height:100vh; gap:.7rem; background:#f8f9fd; color:#29284d; text-align:center; }
    .oauth-callback h1 { margin:0; font-size:1.5rem; letter-spacing:-.04em; }
    .oauth-callback p { margin:0; color:#858798; font-size:.8rem; }
    .loader { width:2.2rem; height:2.2rem; border:3px solid #deddf8; border-top-color:#5c58d8; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class OAuthCallbackComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    try {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const token = params.get('token');
      const user = params.get('user');
      if (!token || !user) throw new Error('Respuesta OAuth incompleta');
      const parsedUser = JSON.parse(user) as User;
      this.auth.completeExternalLogin(token, parsedUser);
      this.router.navigateByUrl(parsedUser.role === 'ADMIN' ? '/admin' : '/mi-cuenta');
    } catch {
      this.router.navigate(['/login'], { queryParams: { oauthError: 'true' } });
    }
  }
}
