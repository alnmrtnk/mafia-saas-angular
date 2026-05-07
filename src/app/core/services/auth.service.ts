import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { delay, Observable, of, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { AnalyticsService } from './analytics.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private userSignal = signal<User | null>(this.readCurrentUser());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly role = computed(() => this.currentUser()?.role ?? null);

  login(email: string, password: string): Observable<User> {
    const user = this.storage.get<User>('users').find(candidate => candidate.email.toLowerCase() === email.toLowerCase() && candidate.passwordHash === btoa(password));
    if (!user || user.isBanned) throw new Error('Invalid credentials or banned account');
    return of(user).pipe(delay(this.latency()), tap(found => this.persist(found, 'user_login')));
  }

  register(username: string, email: string, password: string, role: Exclude<UserRole, 'Admin'>): Observable<User> {
    const users = this.storage.get<User>('users');
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already registered');
    const user: User = { id: this.storage.id('u'), username, email, passwordHash: btoa(password), role, avatarUrl: username.slice(0, 2).toUpperCase(), createdAt: new Date().toISOString(), subscriptionId: null };
    this.storage.set('users', [user, ...users]);
    return of(user).pipe(delay(this.latency()), tap(created => this.persist(created, 'user_registered')));
  }

  logout(): void {
    localStorage.removeItem('mafia_token');
    this.userSignal.set(null);
    this.router.navigateByUrl('/');
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.role();
    return !!role && roles.includes(role);
  }

  private persist(user: User, event: 'user_login' | 'user_registered'): void {
    const token = btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 }));
    localStorage.setItem('mafia_token', token);
    this.userSignal.set(user);
    this.analytics.trackEvent('Auth', event, user.role);
  }

  private readCurrentUser(): User | null {
    try {
      const token = localStorage.getItem('mafia_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token));
      return this.storage.get<User>('users').find(user => user.id === payload.sub) ?? null;
    } catch {
      return null;
    }
  }

  private latency(): number {
    return 300 + Math.round(Math.random() * 400);
  }
}
