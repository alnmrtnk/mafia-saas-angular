import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { PlayerStatistics } from '../../core/models/statistics.model';
import { StatisticsService } from '../../core/services/statistics.service';
import { RoleColorPipe } from '../../shared/pipes/role-color.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RoleColorPipe],
  template: `<main class="page profile-page"><div class="cover"></div><div class="container profile"><section class="hero card"><span class="avatar">JC</span><h1>{{ entry()?.username ?? 'john_citizen' }}</h1><span class="badge blue">B2C Player</span></section><section class="grid five stats"><article><b>{{ stats()?.totalGames }}</b><span>Games</span></article><article><b>{{ stats()?.winRate | percent:'1.0-0' }}</b><span>Win rate</span></article><article><b>{{ stats()?.rating }}</b><span>Rating</span></article><article><b>#{{ stats()?.rank }}</b><span>Rank</span></article><article><b>{{ stats()?.favoriteRole }}</b><span>Favorite role</span></article></section><section class="grid three">@defer { <article class="card chart"><h2>Rating</h2><canvas baseChart [type]="'line'" [data]="ratingData()" [options]="lineOptions()"></canvas></article><article class="card chart"><h2>Wins by role</h2><canvas baseChart [type]="'bar'" [data]="barData()" [options]="chartOptions()"></canvas></article><article class="card chart"><h2>Games by role</h2><canvas baseChart [type]="'doughnut'" [data]="donutData()" [options]="donutOptions()"></canvas></article> }</section><section class="card table"><h2>Game history</h2><table><tbody>@for (g of stats()?.recentGames ?? []; track $index) { <tr><td>{{ g.date | date:'dd.MM.yyyy':'':'uk' }}</td><td><span class="badge" [class]="g.role | roleColor">{{ g.role }}</span></td><td>{{ g.won ? 'Win' : 'Loss' }}</td></tr> }</tbody></table></section><section class="achievements">@for (a of achievements; track a) { <article class="card" [class.locked]="a.includes('Locked')">{{ a }}</article> }</section></div></main>`,
  styles: [`.profile-page{padding-top:76px}.cover{height:220px;background:linear-gradient(110deg,var(--color-primary),#25131b 48%,var(--color-accent));opacity:.92}.profile{position:relative;margin-top:-54px}.hero{padding:64px 24px 28px;text-align:center;overflow:visible}.avatar{display:grid;place-items:center;margin:-118px auto 18px;width:116px;height:116px;border-radius:50%;background:var(--color-primary);border:6px solid var(--color-bg);color:white;font-size:2rem;font-weight:900;box-shadow:0 12px 28px rgba(0,0,0,.22)}.hero h1{font-family:var(--font-display);font-size:clamp(2.1rem,5vw,3rem);line-height:1.05;margin:0 0 12px}.five{grid-template-columns:repeat(5,1fr)}.stats{margin:18px 0}.stats article,.chart,.table,.achievements article{padding:18px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface);box-shadow:var(--shadow-card)}.stats b{display:block;font-family:var(--font-display);font-size:1.8rem;line-height:1.1}.stats span{color:var(--color-text-muted)}.chart{height:340px;overflow:hidden}.chart canvas{display:block!important;width:100%!important;height:250px!important;max-height:250px!important}.chart h2,.table h2{font-family:var(--font-display);font-size:1.35rem}.table{margin-top:18px;overflow:auto}.achievements{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-top:18px}.locked{filter:grayscale(1);opacity:.45}@media(max-width:900px){.five{grid-template-columns:repeat(2,1fr)}.profile{margin-top:-42px}.hero{padding-inline:16px}.avatar{width:96px;height:96px;margin-top:-96px}.chart{height:310px}.chart canvas{height:220px!important;max-height:220px!important}}`]
})
export class ProfileComponent {
  private route = inject(ActivatedRoute);
  private service = inject(StatisticsService);
  readonly stats = computed<PlayerStatistics | null>(() => this.service.forUser(this.route.snapshot.paramMap.get('id') ?? 'u-john') ?? this.service.statistics()[0] ?? null);
  readonly entry = computed(() => this.service.leaderboard().find(e => e.userId === this.stats()?.userId));
  readonly achievements = ['First Win', '10 Games', 'Sheriff Ace', 'Tournament Winner', 'Locked Don Master'];
  readonly ratingData = computed(() => ({ labels: this.stats()?.ratingHistory?.map((_, i) => `G${i + 1}`) ?? [], datasets: [{ label: 'Rating', data: this.stats()?.ratingHistory ?? [], borderColor: '#f0a500', tension: .35 }] }));
  readonly barData = computed(() => ({ labels: this.stats()?.roleBreakdown.map(r => r.role) ?? [], datasets: [{ label: 'Wins', data: this.stats()?.roleBreakdown.map(r => r.wins) ?? [], backgroundColor: '#c9314a' }, { label: 'Losses', data: this.stats()?.roleBreakdown.map(r => r.games - r.wins) ?? [], backgroundColor: '#3d4259' }] }));
  readonly donutData = computed(() => ({ labels: this.stats()?.roleBreakdown.map(r => r.role) ?? [], datasets: [{ data: this.stats()?.roleBreakdown.map(r => r.games) ?? [], backgroundColor: ['#c9314a', '#f0a500', '#3daa6e', '#3d7fe0', '#7a8099'] }] }));
  readonly chartOptions = computed(() => this.options(true));
  readonly lineOptions = computed(() => this.options(true));
  readonly donutOptions = computed(() => this.options(false));

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
