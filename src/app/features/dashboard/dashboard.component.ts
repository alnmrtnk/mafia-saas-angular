import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { PlayerStatistics } from '../../core/models/statistics.model';
import { SubscriptionService } from '../../core/services/subscription.service';
import { TournamentService } from '../../core/services/tournament.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { RoleColorPipe } from '../../shared/pipes/role-color.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, TimeAgoPipe, RoleColorPipe],
  template: `
    <main class="page"><div class="container layout">
      <aside class="side card"><strong>Mafia SaaS</strong><a routerLink="/game">Find a Game</a><a routerLink="/leaderboard">Leaderboard</a><a [routerLink]="['/profile', auth.currentUser()?.id]">My Statistics</a><a routerLink="/subscription">Upgrade Plan</a></aside>
      <section>
        <h1 class="section-title">Dashboard</h1>
        <div class="grid four kpis">
          <article class="card"><span>Total Games</span><b>{{ stats()?.totalGames ?? 0 }}</b></article>
          <article class="card"><span>Win Rate</span><b>{{ (stats()?.winRate ?? 0) | percent:'1.0-0' }}</b></article>
          <article class="card"><span>Rating</span><b>{{ stats()?.rating ?? 1200 }}</b></article>
          <article class="card"><span>Subscription</span><b>{{ subscription.current()?.plan ?? 'FREE' }}</b></article>
        </div>
        <div class="grid two main-grid">
          <article class="card panel"><h2>Recent activity</h2>@for (game of stats()?.recentGames ?? []; track $index) { <div class="activity"><span class="badge" [class]="game.role | roleColor">{{ game.role }}</span><span>{{ game.won ? 'Victory' : 'Defeat' }}</span><small>{{ game.date | timeAgo }}</small></div> }</article>
          <article class="card panel chart-panel"><h2>Role performance</h2>@defer { <canvas baseChart [data]="chartData()" [options]="chartOptions()" [type]="'doughnut'"></canvas> } @placeholder { <p class="muted">Loading chart...</p> }</article>
          <article class="card panel"><h2>Quick actions</h2><div class="quick"><a class="btn primary" routerLink="/game">Find a Game</a><a class="btn" routerLink="/leaderboard">View Leaderboard</a><a class="btn" [routerLink]="['/profile', auth.currentUser()?.id]">My Statistics</a><a class="btn gold" routerLink="/subscription">Upgrade Plan</a></div></article>
          <article class="card panel"><h2>Upcoming tournaments</h2>@for (t of tournaments.tournaments().slice(0, 2); track t.id) { <p><b>{{ t.name }}</b><br><span class="muted">{{ t.startDate | date:'dd.MM.yyyy':'':'uk' }} · {{ t.prize }}</span></p> }</article>
        </div>
      </section>
    </div></main>
  `,
  styles: [`.layout{display:grid;grid-template-columns:230px 1fr;gap:22px}.side{position:sticky;top:96px;align-self:start;padding:16px;display:grid;gap:8px}.side strong{font-family:var(--font-display);margin-bottom:8px}.side a{padding:11px;border-radius:var(--radius-sm);color:var(--color-text-muted)}.side a:hover{background:rgba(255,255,255,.05);color:var(--color-text)}.kpis .card{padding:20px}.kpis span{color:var(--color-text-muted)}.kpis b{display:block;font-family:var(--font-display);font-size:2rem;margin-top:8px}.main-grid{margin-top:18px}.panel{padding:20px}.panel h2{font-family:var(--font-display);margin-top:0}.chart-panel{height:340px;overflow:hidden}.chart-panel canvas{display:block!important;width:100%!important;height:260px!important;max-height:260px!important}.activity{display:grid;grid-template-columns:110px 1fr auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--color-border)}.quick{display:flex;flex-wrap:wrap;gap:10px}@media(max-width:860px){.layout{grid-template-columns:1fr}.side{position:static}}`]
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly statistics = inject(StatisticsService);
  readonly subscription = inject(SubscriptionService);
  readonly tournaments = inject(TournamentService);
  readonly stats = computed<PlayerStatistics | null>(() => this.statistics.forUser(this.auth.currentUser()?.id ?? 'u-john') ?? this.statistics.statistics()[0] ?? null);
  readonly chartData = computed(() => ({ labels: this.stats()?.roleBreakdown.map(role => role.role) ?? [], datasets: [{ data: this.stats()?.roleBreakdown.map(role => role.wins) ?? [], backgroundColor: ['#c9314a', '#f0a500', '#3daa6e', '#3d7fe0', '#7a8099'] }] }));
  readonly chartOptions = computed(() => {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#7a8099';
    return { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color } } } };
  });
}
