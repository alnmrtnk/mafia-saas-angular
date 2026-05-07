import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { GameSession } from '../../core/models/game.model';
import { Subscription } from '../../core/models/subscription.model';
import { Tournament } from '../../core/models/tournament.model';
import { User } from '../../core/models/user.model';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `<main class="page"><div class="container admin"><aside class="card"><button (click)="section.set('Users')">Users</button><button (click)="section.set('Games')">Games</button><button (click)="section.set('Tournaments')">Tournaments</button><button (click)="section.set('Analytics')">Analytics</button></aside><section><h1 class="section-title">Admin · {{ section() }}</h1><div class="grid four"><article class="card kpi">Users <b>{{ users().length }}</b></article><article class="card kpi">Subscriptions <b>{{ subs().length }}</b></article><article class="card kpi">Games today <b>{{ games().length }}</b></article><article class="card kpi">Revenue <b>₴{{ revenue() }}</b></article></div>@if (section() === 'Users') { <input class="input search" [(ngModel)]="query" placeholder="Search users"><div class="card table"><table><tbody>@for (u of filteredUsers(); track u.id) { <tr><td>{{ u.username }}</td><td>{{ u.email }}</td><td><span class="badge">{{ u.role }}</span></td><td><button class="btn" (click)="toggleBan(u)">{{ u.isBanned ? 'Unban' : 'Ban' }}</button></td></tr> }</tbody></table></div> } @if (section() === 'Games') { <div class="card table"><table><tbody>@for (g of games(); track g.id) { <tr><td>{{ g.name }}</td><td>{{ g.status }}</td><td><button class="btn" (click)="complete(g)">Force complete</button><button class="btn ghost" (click)="remove(g.id)">Delete</button></td></tr> }</tbody></table></div> } @if (section() === 'Tournaments') { <div class="card table"><table><tbody>@for (t of tournaments(); track t.id) { <tr><td>{{ t.name }}</td><td>{{ t.status }}</td><td>{{ t.participants.length }}</td></tr> }</tbody></table></div> } @if (section() === 'Analytics') { @defer { <div class="grid three"><article class="card chart"><canvas baseChart [type]="'line'" [data]="line" [options]="axisOptions()"></canvas></article><article class="card chart"><canvas baseChart [type]="'bar'" [data]="bar" [options]="axisOptions()"></canvas></article><article class="card chart"><canvas baseChart [type]="'pie'" [data]="pie()" [options]="legendOptions()"></canvas></article></div> } }</section></div></main>`,
  styles: [`.admin{display:grid;grid-template-columns:210px 1fr;gap:20px}aside{padding:14px;display:grid;gap:8px;align-self:start;position:sticky;top:96px}aside button{border:0;border-radius:var(--radius-sm);padding:12px;background:var(--color-surface-2);color:var(--color-text)}.kpi{padding:18px}.kpi b{display:block;font-family:var(--font-display);font-size:2rem}.search{margin:18px 0;max-width:340px}.table{overflow:auto}.chart{padding:16px;height:320px;overflow:hidden}.chart canvas{display:block!important;width:100%!important;height:288px!important;max-height:288px!important}@media(max-width:860px){.admin{grid-template-columns:1fr}aside{position:static}}`]
})
export class AdminComponent {
  private storage = inject(StorageService);
  readonly section = signal('Users');
  query = '';
  readonly users = signal(this.storage.get<User>('users'));
  readonly games = signal(this.storage.get<GameSession>('games'));
  readonly tournaments = signal(this.storage.get<Tournament>('tournaments'));
  readonly subs = signal(this.storage.get<Subscription>('subscriptions'));
  readonly revenue = computed(() => this.subs().reduce((sum, sub) => sum + sub.amount, 0));
  readonly filteredUsers = computed(() => this.users().filter(u => u.username.toLowerCase().includes(this.query.toLowerCase())));
  readonly line = { labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`), datasets: [{ label: 'Registrations', data: Array.from({ length: 30 }, (_, i) => 2 + (i % 7)), borderColor: '#f0a500' }] };
  readonly bar = { labels: Array.from({ length: 7 }, (_, i) => `D${i + 1}`), datasets: [{ label: 'Games', data: [8, 12, 10, 16, 19, 22, 14], backgroundColor: '#c9314a' }] };
  readonly pie = computed(() => ({ labels: ['BASIC', 'PRO', 'CLUB'], datasets: [{ data: [4, 2, 1], backgroundColor: ['#c9314a', '#f0a500', '#3d7fe0'] }] }));
  readonly legendOptions = computed(() => this.options(false));
  readonly axisOptions = computed(() => this.options(true));
  toggleBan(user: User) { user.isBanned = !user.isBanned; this.storage.upsert('users', user); this.users.set(this.storage.get<User>('users')); }
  complete(game: GameSession) { game.status = 'Completed'; game.completedAt = new Date().toISOString(); game.winningSide = 'Citizens'; this.storage.upsert('games', game); this.games.set(this.storage.get<GameSession>('games')); }
  remove(id: string) { this.storage.remove('games', id); this.games.set(this.storage.get<GameSession>('games')); }
  private options(scales: boolean) {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#7a8099';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color } } },
      scales: scales ? { x: { ticks: { color }, grid: { color: 'rgba(122,128,153,.18)' } }, y: { ticks: { color }, grid: { color: 'rgba(122,128,153,.18)' } } } : undefined
    };
  }
}
