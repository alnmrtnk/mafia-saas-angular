import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { RoleColorPipe } from '../../shared/pipes/role-color.pipe';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RoleColorPipe],
  template: `<main class="page"><div class="container"><h1 class="section-title">Global Leaderboard</h1><div class="tabs">@for (tab of tabs; track tab) { <button [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button> }</div><section class="podium">@for (p of top3(); track p.userId; let i = $index) { <article class="card place p{{i}}"><span>#{{ p.rank }}</span><b>{{ p.username }}</b><em>{{ p.rating }}</em></article> }</section><input class="input search" placeholder="Search username" [(ngModel)]="query"><section class="card table-wrap"><table><thead><tr><th>Rank</th><th>Player</th><th>Rating</th><th>Win rate</th><th>Games</th><th>Favorite role</th></tr></thead><tbody>@for (entry of filtered(); track entry.userId) { <tr><td>#{{ entry.rank }}</td><td><span class="avatar">{{ entry.avatarUrl }}</span>{{ entry.username }}</td><td>{{ entry.rating }}</td><td>{{ entry.winRate | percent:'1.0-0' }}</td><td>{{ entry.totalGames }}</td><td><span class="badge" [class]="entry.favoriteRole | roleColor">{{ entry.favoriteRole }}</span></td></tr> }</tbody></table></section></div></main>`,
  styles: [`.tabs{display:flex;gap:8px;margin-bottom:18px}.tabs button{border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-2);color:var(--color-text-muted);padding:10px 14px}.tabs .active{background:var(--color-primary);color:white}.podium{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:end;margin-bottom:20px}.place{padding:22px;text-align:center}.p0{min-height:190px;border-color:rgba(240,165,0,.6)}.p1{min-height:150px}.p2{min-height:130px}.place span,.place em{display:block;color:var(--color-accent);font-style:normal}.place b{font-family:var(--font-display);font-size:1.6rem}.search{max-width:340px;margin-bottom:16px}.table-wrap{overflow:auto}.avatar{display:inline-grid;place-items:center;margin-right:10px;width:34px;height:34px;border-radius:50%;background:var(--color-primary);color:white;font-weight:800}tr:hover{background:rgba(255,255,255,.04)}@media(max-width:760px){.podium{grid-template-columns:1fr}}`]
})
export class LeaderboardComponent {
  readonly stats = inject(StatisticsService);
  readonly activeTab = signal('All Time');
  query = '';
  readonly tabs = ['All Time', 'This Month', 'By Role'];
  readonly top3 = computed(() => this.stats.leaderboard().slice(0, 3));
  readonly filtered = computed(() => this.stats.leaderboard().filter(e => e.username.toLowerCase().includes(this.query.toLowerCase())));
  constructor() { inject(AnalyticsService).track('leaderboard_viewed'); }
}
