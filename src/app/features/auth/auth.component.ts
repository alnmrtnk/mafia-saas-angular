import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Moon, Search, Spade } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  template: `
    <main class="auth-page">
      <aside class="art">
        <lucide-icon [img]="Spade" class="float one"/><lucide-icon [img]="Moon" class="float two"/><lucide-icon [img]="Search" class="float three"/>
        <h1>{{ isRegister() ? 'Join the table' : 'Welcome back' }}</h1><p>Every vote matters. Every phase leaves a trace.</p>
      </aside>
      <section class="panel card">
        <h2>{{ isRegister() ? 'Create account' : 'Login' }}</h2>
        @if (error()) { <p class="error">{{ error() }}</p> }
        @if (isRegister()) {
          <div class="modes"><button [class.active]="role() === 'B2CUser'" (click)="role.set('B2CUser')">B2C Player</button><button [class.active]="role() === 'B2BUser'" (click)="role.set('B2BUser')">B2B Organizer</button></div>
          <label class="form-field"><span>Username</span><input class="input" [(ngModel)]="username" required></label>
        }
        <label class="form-field"><span>Email</span><input class="input" [(ngModel)]="email" type="email" required></label>
        <label class="form-field"><span>Password</span><input class="input" [(ngModel)]="password" type="password" required></label>
        @if (isRegister()) { <label class="form-field"><span>Confirm password</span><input class="input" [(ngModel)]="confirm" type="password" required></label> }
        @if (!isRegister()) { <label class="remember"><input type="checkbox" [(ngModel)]="remember"> Remember me</label> }
        <button class="btn primary block" [disabled]="loading()" (click)="submit()">{{ loading() ? 'Loading...' : isRegister() ? 'Register' : 'Login' }}</button>
        <p class="muted">{{ isRegister() ? 'Already registered?' : 'New to Mafia SaaS?' }} <a [routerLink]="isRegister() ? '/auth/login' : '/auth/register'">{{ isRegister() ? 'Login' : 'Create account' }}</a></p>
        <p class="hint">Demo admin: admin&#64;mafia.gg / admin</p>
      </section>
    </main>
  `,
  styles: [`.auth-page{min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr}.art{position:relative;overflow:hidden;display:grid;place-content:center;padding:42px;background:radial-gradient(circle at 50% 30%,rgba(201,49,74,.28),transparent 36%),var(--color-bg)}.art h1{font-family:var(--font-display);font-size:clamp(2.5rem,6vw,5.8rem);margin:0}.art p{color:var(--color-text-muted);font-size:1.2rem}.float{position:absolute;color:rgba(240,165,0,.22);animation:float-dot 8s infinite}.one{left:18%;top:22%}.two{right:22%;top:28%;animation-duration:10s}.three{left:28%;bottom:24%;animation-duration:12s}.panel{align-self:center;justify-self:center;width:min(440px,calc(100% - 32px));padding:28px}.panel h2{font-family:var(--font-display);font-size:2.2rem;margin:0 0 20px}.form-field{margin-bottom:14px}.modes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.modes button{padding:12px;border-radius:var(--radius-md);border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-text-muted);transition:transform var(--transition)}.modes .active{color:white;border-color:var(--color-primary);background:var(--color-primary)}.remember{display:flex;gap:8px;color:var(--color-text-muted);margin-bottom:14px}.error{color:#ff9daf}.hint{font-size:.82rem;color:var(--color-text-faint)}a{color:var(--color-accent)}button:disabled{opacity:.65}@media(max-width:860px){.auth-page{grid-template-columns:1fr}.art{min-height:320px}.panel{margin:32px 0}}`]
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  readonly mode = signal(location.pathname.includes('register') ? 'register' : 'login');
  readonly isRegister = computed(() => this.mode() === 'register');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly role = signal<'B2CUser' | 'B2BUser'>('B2CUser');
  readonly Spade = Spade;
  readonly Moon = Moon;
  readonly Search = Search;
  username = '';
  email = '';
  password = '';
  confirm = '';
  remember = true;

  submit(): void {
    this.error.set('');
    if (this.isRegister() && this.password !== this.confirm) { this.error.set('Passwords do not match'); return; }
    this.loading.set(true);
    const request = this.isRegister() ? this.auth.register(this.username, this.email, this.password, this.role()) : this.auth.login(this.email, this.password);
    request.subscribe({
      next: () => { this.toast.show('success', this.isRegister() ? 'Welcome to Mafia SaaS' : 'Welcome back'); this.router.navigateByUrl('/dashboard'); },
      error: (err) => this.error.set(err.message || 'Authentication failed'),
      complete: () => this.loading.set(false)
    });
  }
}
