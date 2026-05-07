import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { Invoice, Subscription, SubscriptionPlan } from '../models/subscription.model';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth.service';
import { PLAN_CONFIGS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private analytics = inject(AnalyticsService);
  readonly plans = PLAN_CONFIGS;
  readonly subscriptions = signal<Subscription[]>(this.storage.get<Subscription>('subscriptions'));

  current(): Subscription | null {
    const user = this.auth.currentUser();
    return user ? this.subscriptions().find(sub => sub.userId === user.id && sub.isActive) ?? null : null;
  }

  upgrade(plan: SubscriptionPlan, provider: 'LiqPay' | 'Stripe'): Observable<Subscription> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Authentication required');
    const config = this.plans.find(item => item.id === plan)!;
    const subscription: Subscription = { id: this.storage.id('sub'), userId: user.id, plan, startDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(), isActive: true, paymentMethod: provider, amount: config.price };
    const invoice: Invoice = { id: this.storage.id('inv'), userId: user.id, plan, amount: config.price, currency: 'UAH', createdAt: new Date().toISOString(), provider };
    this.storage.set('subscriptions', [subscription, ...this.subscriptions().map(sub => sub.userId === user.id ? { ...sub, isActive: false } : sub)]);
    this.storage.set('invoices', [invoice, ...this.storage.get<Invoice>('invoices')]);
    return of(subscription).pipe(delay(1500), tap(saved => {
      this.subscriptions.set(this.storage.get<Subscription>('subscriptions'));
      this.analytics.trackEvent('Subscription', 'plan_upgraded', saved.plan, saved.amount);
    }));
  }
}
