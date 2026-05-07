import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LogOut, Menu, ShieldCheck, User } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, ThemeToggleComponent, LanguageSwitcherComponent, TranslatePipe],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand" aria-label="Mafia SaaS home">
        <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="5" width="30" height="38" rx="5"/><path d="M15 21c6-10 12-10 18 0M18 23h12l-2 8h-8z"/></svg>
        <span>Mafia SaaS</span>
      </a>
      <button class="menu" type="button" aria-label="Toggle navigation" (click)="toggleMenu()"><lucide-icon [img]="Menu" size="20"></lucide-icon></button>
      <nav [class.open]="open()">
        <a routerLink="/game" routerLinkActive="active">{{ 'nav.games' | t }}</a>
        <a routerLink="/tournament" routerLinkActive="active">{{ 'nav.tournaments' | t }}</a>
        <a routerLink="/leaderboard" routerLinkActive="active">{{ 'nav.leaderboard' | t }}</a>
        <a routerLink="/subscription" routerLinkActive="active">{{ 'nav.pricing' | t }}</a>
        @if (auth.currentUser(); as user) {
          <a routerLink="/dashboard" routerLinkActive="active"><lucide-icon [img]="ShieldCheck" size="16"></lucide-icon>{{ 'nav.dashboard' | t }}</a>
          <a [routerLink]="['/profile', user.id]" routerLinkActive="active"><lucide-icon [img]="User" size="16"></lucide-icon>{{ user.username }}</a>
          <button class="link-btn" type="button" (click)="auth.logout()"><lucide-icon [img]="LogOut" size="16"></lucide-icon>{{ 'nav.logout' | t }}</button>
        } @else {
          <a routerLink="/auth/login" class="login">{{ 'nav.login' | t }}</a>
          <a routerLink="/auth/register" class="btn primary small">{{ 'nav.start' | t }}</a>
        }
        <app-language-switcher />
        <app-theme-toggle />
      </nav>
    </header>
  `,
  styles: [`
    .nav{position:fixed;z-index:50;inset:0 0 auto;min-height:76px;padding:0 max(16px,calc((100vw - 1180px)/2));display:flex;align-items:center;gap:14px;background:color-mix(in srgb,var(--color-bg) 88%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid var(--color-border);overflow:hidden}
    .brand{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:900;font-size:1.15rem;white-space:nowrap}.brand svg{width:38px;height:38px;flex:0 0 auto;fill:none;stroke:var(--color-primary);stroke-width:2.2;filter:drop-shadow(0 0 10px var(--color-primary-glow))}
    nav{margin-left:auto;display:flex;align-items:center;gap:6px;min-width:0}nav a,.link-btn{min-height:38px;display:inline-flex;align-items:center;gap:6px;padding:0 9px;border-radius:var(--radius-sm);color:var(--color-text-muted);background:transparent;border:0;white-space:nowrap}.link-btn{color:var(--color-text-muted)}
    nav a{max-width:150px;overflow:hidden;text-overflow:ellipsis}
    nav a:hover,nav a.active,.link-btn:hover{color:var(--color-text);background:rgba(255,255,255,.05)}.small{min-height:38px;padding:0 14px;color:white}.menu{display:none;margin-left:auto;background:var(--color-surface-2);color:var(--color-text);border:1px solid var(--color-border);border-radius:var(--radius-sm);width:40px;height:40px}
    @media(max-width:1100px){.menu{display:grid;place-items:center}nav{position:absolute;top:76px;left:16px;right:16px;display:none;flex-direction:column;align-items:stretch;padding:12px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);box-shadow:var(--shadow-card)}nav.open{display:flex}.link-btn,nav a{justify-content:center;max-width:none}.nav{overflow:visible}}
  `]
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly open = signal(false);
  readonly Menu = Menu;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly ShieldCheck = ShieldCheck;

  toggleMenu(): void {
    this.open.update(value => !value);
  }
}
