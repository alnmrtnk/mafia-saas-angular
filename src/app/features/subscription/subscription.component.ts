import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubscriptionPlan } from '../../core/models/subscription.model';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `<main class="page"><div class="container"><h1 class="section-title">Subscription</h1><section class="card current"><span class="badge gold">Current plan</span><h2>{{ service.current()?.plan ?? 'FREE' }}</h2><p class="muted">Expires {{ service.current()?.expiresAt | date:'dd.MM.yyyy':'':'uk' }}</p></section><div class="grid three">@for (plan of service.plans; track plan.id) { <article class="card plan"><span class="badge" [class.gold]="plan.price > 0">{{ plan.name }}</span><h2>{{ plan.price ? '₴' + plan.price : 'Free' }}</h2><ul>@for (feature of plan.features; track feature) { <li>{{ feature }}</li> }</ul><button class="btn primary block" [disabled]="service.current()?.plan === plan.id" (click)="checkout(plan.id)">{{ service.current()?.plan === plan.id ? 'Current Plan' : 'Upgrade' }}</button></article> }</div></div></main><app-modal [open]="open()" title="Checkout" (closed)="open.set(false)"><section class="checkout"><div class="modes"><button [class.active]="provider === 'LiqPay'" (click)="provider = 'LiqPay'">LiqPay</button><button [class.active]="provider === 'Stripe'" (click)="provider = 'Stripe'">Stripe</button></div><input class="input" placeholder="4242 4242 4242 4242"><div class="grid two"><input class="input" placeholder="MM/YY"><input class="input" placeholder="CVV"></div><button class="btn primary block" (click)="pay()">Pay {{ amount() }} UAH</button>@if (success()) { <div class="success">✓ Subscription updated</div> }</section></app-modal>`,
  styles: [`.current{padding:22px;margin-bottom:18px}.current h2,.plan h2{font-family:var(--font-display);font-size:2.2rem}.plan{padding:22px}.plan li{margin:10px 0;color:var(--color-text-muted)}button:disabled{opacity:.6}.checkout{padding:20px;display:grid;gap:14px}.modes{display:grid;grid-template-columns:1fr 1fr;gap:8px}.modes button{padding:12px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-2);color:var(--color-text-muted)}.modes .active{background:var(--color-primary);color:white}.success{padding:16px;color:#9be3bd;text-align:center}`]
})
export class SubscriptionComponent {
  readonly service = inject(SubscriptionService);
  readonly open = signal(false);
  readonly success = signal(false);
  plan: SubscriptionPlan = 'B2C_BASIC';
  provider: 'LiqPay' | 'Stripe' = 'LiqPay';
  checkout(plan: SubscriptionPlan) { this.plan = plan; this.success.set(false); this.open.set(true); }
  amount() { return this.service.plans.find(p => p.id === this.plan)?.price ?? 0; }
  pay() { this.service.upgrade(this.plan, this.provider).subscribe(() => this.success.set(true)); }
}
