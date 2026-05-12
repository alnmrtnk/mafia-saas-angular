import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Crown, Swords, Trophy, Users } from 'lucide-angular';
import { AnalyticsService } from '../../core/services/analytics.service';
import { LanguageService } from '../../core/services/language.service';
import { PLAN_CONFIGS } from '../../core/services/storage.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { fadeInUp, staggerList } from '../../shared/animations';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslatePipe],
  animations: [fadeInUp, staggerList],
  template: `
    <section class="hero">
      <div class="particles">@for (dot of dots; track dot) { <i [style.left.%]="dot * 7 % 100" [style.animation-delay.ms]="dot * 180" [style.animation-duration.s]="8 + dot % 8"></i> }</div>
      <div class="container hero-inner" @fadeInUp>
        <span class="badge gold">{{ 'landing.badge' | t }}</span>
        <h1>{{ 'landing.heroTitle' | t }}</h1>
        <p class="type">{{ 'landing.for' | t }} {{ wordKeys[wordIndex()] | t }}<span></span></p>
        <div class="actions">
          <a class="btn primary" routerLink="/auth/register" (click)="track('Start Playing')">{{ 'landing.startPlaying' | t }}</a>
          <a class="btn gold" routerLink="/subscription" (click)="track('For Clubs')">{{ 'landing.forClubs' | t }}</a>
        </div>
        <a class="scroll" href="#features" aria-label="Scroll to features"></a>
      </div>
    </section>

    <section id="features" class="container feature-section">
      <h2 class="section-title">{{ 'landing.featuresTitle' | t }}</h2>
      <div class="feature-grid" @staggerList>
        <article class="feature large"><lucide-icon [img]="Swords"></lucide-icon><h3>{{ 'landing.feature.automation.title' | t }}</h3><p>{{ 'landing.feature.automation.text' | t }}</p></article>
        <article class="feature"><lucide-icon [img]="Users"></lucide-icon><h3>{{ 'landing.feature.scenarios.title' | t }}</h3><p>{{ 'landing.feature.scenarios.text' | t }}</p></article>
        <article class="feature"><lucide-icon [img]="Trophy"></lucide-icon><h3>{{ 'landing.feature.tournaments.title' | t }}</h3><p>{{ 'landing.feature.tournaments.text' | t }}</p></article>
        <article class="feature wide"><lucide-icon [img]="Crown"></lucide-icon><h3>{{ 'landing.feature.stats.title' | t }}</h3><p>{{ 'landing.feature.stats.text' | t }}</p></article>
        <article class="feature"><h3>{{ 'landing.feature.cabinets.title' | t }}</h3><p>{{ 'landing.feature.cabinets.text' | t }}</p></article>
      </div>
    </section>

    <section class="how">
      <div class="container">
        <h2 class="section-title">{{ 'landing.howTitle' | t }}</h2>
        <div class="steps">
          @for (step of stepKeys; track step; let i = $index) {
            <article><b>0{{ i + 1 }}</b><h3>{{ step | t }}</h3></article>
          }
        </div>
      </div>
    </section>

    <section class="container pricing">
      <div class="price-head">
        <h2 class="section-title">{{ 'landing.pricingTitle' | t }}</h2>
        <div class="toggle"><button [class.active]="audience() === 'b2c'" (click)="audience.set('b2c')">B2C</button><button [class.active]="audience() === 'b2b'" (click)="audience.set('b2b')">B2B</button></div>
      </div>
      <div class="grid three">
        @for (plan of shownPlans(); track plan.id) {
          <article class="plan card" [class.popular]="plan.id === 'B2C_PRO' || plan.id === 'B2B_CLUB'">
            <span class="badge" [class.gold]="plan.price > 0">{{ plan.name }}</span>
            <h3>{{ plan.price === 0 ? ('landing.free' | t) : '₴' + plan.price }}</h3>
            <p class="muted">{{ 'landing.perMonth' | t }}</p>
            <ul>@for (feature of translatedFeatures(plan.features); track feature) { <li>{{ feature }}</li> }</ul>
            <a class="btn primary block" routerLink="/subscription">{{ 'landing.trial' | t }}</a>
          </article>
        }
      </div>
    </section>

    <section class="container leaderboard">
      <h2 class="section-title">{{ 'landing.leaderboardTitle' | t }}</h2>
      <div class="card table-wrap">
        <table>
          <tbody>
            @for (entry of stats.leaderboard().slice(0, 5); track entry.userId) {
              <tr><td>#{{ entry.rank }}</td><td><span class="avatar">{{ entry.avatarUrl }}</span>{{ entry.username }}</td><td><span class="badge gold">{{ entry.rating }}</span></td><td>{{ entry.winRate | percent:'1.0-0' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="container testimonials">
      @for (review of reviews; track review.name) {
        <article class="card review"><div class="stars">*****</div><p>"{{ review.textKey | t }}"</p><strong>{{ review.name }}</strong><span class="badge blue">{{ review.roleKey | t }}</span></article>
      }
    </section>

    <section class="cta">
      <div class="container"><h2>{{ 'landing.ctaTitle' | t }}</h2><a class="btn primary" routerLink="/auth/register" (click)="track('CTA Banner')">{{ 'landing.ctaButton' | t }}</a></div>
    </section>
  `,
  styles: [`
    .hero{position:relative;min-height:100vh;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 20%,rgba(201,49,74,.18),transparent 34%),var(--color-bg)}.hero-inner{text-align:center;position:relative;z-index:1}.hero h1{font-family:var(--font-display);font-size:clamp(3rem,9vw,7rem);line-height:.95;margin:18px 0 10px}.type{font-size:clamp(1.1rem,3vw,1.8rem);color:var(--color-text-muted)}.type span{display:inline-block;width:2px;height:1.1em;background:var(--color-accent);margin-left:4px;vertical-align:middle;animation:type-blink .8s infinite}.actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:28px}.particles{position:absolute;inset:0}.particles i{position:absolute;bottom:-20px;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.7);animation:float-dot linear infinite}.scroll{position:absolute;bottom:34px;left:50%;width:22px;height:38px;border:1px solid var(--color-border);border-radius:99px}.scroll:after{content:'';position:absolute;left:50%;top:8px;width:4px;height:4px;border-radius:50%;background:var(--color-accent);animation:float-dot 1.8s infinite}
    .feature-section,.pricing,.leaderboard{padding:86px 0}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.feature{position:relative;overflow:hidden;min-height:210px;padding:24px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:linear-gradient(145deg,var(--color-surface),var(--color-surface-2));transition:transform var(--transition),border-color var(--transition),box-shadow var(--transition)}.feature:hover{transform:translateY(-5px);border-color:rgba(201,49,74,.55);box-shadow:var(--shadow-glow-red)}.feature.large{grid-column:span 2;min-height:280px}.feature.wide{grid-column:span 2}.feature h3{font-family:var(--font-display);font-size:1.5rem}.feature lucide-icon{color:var(--color-accent)}
    .how{padding:76px 0;background:var(--color-surface)}.steps{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.steps:before{content:'';position:absolute;top:42px;left:12%;right:12%;height:2px;background:linear-gradient(90deg,var(--color-primary),var(--color-accent));opacity:.55}.steps article{position:relative;padding:24px;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface-2)}.steps b{font-family:var(--font-display);font-size:2rem;color:var(--color-accent)}
    .price-head{display:flex;align-items:center;justify-content:space-between;gap:18px}.toggle{padding:4px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface-2)}.toggle button{border:0;border-radius:var(--radius-sm);background:transparent;color:var(--color-text-muted);padding:10px 16px}.toggle .active{background:var(--color-primary);color:white}.plan{padding:22px}.plan.popular{border-color:rgba(240,165,0,.55);box-shadow:var(--shadow-glow-gold)}.plan h3{font-family:var(--font-display);font-size:2.5rem;margin:18px 0 0}.plan li{margin:10px 0;color:var(--color-text-muted)}.table-wrap{overflow:auto}.avatar{display:inline-grid;place-items:center;margin-right:10px;width:34px;height:34px;border-radius:50%;background:var(--color-primary);color:white;font-weight:800}.testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:82px}.review{padding:22px}.stars{color:var(--color-accent);letter-spacing:.08em}.cta{padding:64px 0;background:linear-gradient(90deg,#751827,var(--color-primary),#751827);text-align:center}.cta h2{font-family:var(--font-display);font-size:clamp(2rem,5vw,4rem)}
    @media(max-width:860px){.feature-grid,.steps,.testimonials{grid-template-columns:1fr}.feature.large,.feature.wide{grid-column:auto}.steps:before{display:none}.price-head{align-items:flex-start;flex-direction:column}}
  `]
})
export class LandingComponent {
  readonly stats = inject(StatisticsService);
  private analytics = inject(AnalyticsService);
  private language = inject(LanguageService);
  readonly dots = Array.from({ length: 44 }, (_, index) => index + 1);
  readonly wordKeys = ['landing.word.players', 'landing.word.clubs', 'landing.word.champions'];
  readonly stepKeys = ['landing.step.account', 'landing.step.game', 'landing.step.victory'];
  readonly wordIndex = signal(0);
  readonly audience = signal<'b2c' | 'b2b'>('b2c');
  readonly Swords = Swords;
  readonly Users = Users;
  readonly Trophy = Trophy;
  readonly Crown = Crown;
  readonly reviews = [
    { name: 'Nazar', roleKey: 'landing.role.player', textKey: 'landing.review.nazar.text' },
    { name: 'Iryna', roleKey: 'landing.role.organizer', textKey: 'landing.review.iryna.text' },
    { name: 'Marko', roleKey: 'landing.role.champion', textKey: 'landing.review.marko.text' }
  ];
  readonly featureKeyMap = new Map<string, string>([
    ['5 games/month', 'plan.feature.5games'],
    ['Basic stats', 'plan.feature.basicStats'],
    ['Unlimited games', 'plan.feature.unlimitedGames'],
    ['Full stats', 'plan.feature.fullStats'],
    ['Leaderboard', 'plan.feature.leaderboard'],
    ['Tournaments', 'plan.feature.tournaments'],
    ['Priority support', 'plan.feature.prioritySupport'],
    ['Advanced history', 'plan.feature.advancedHistory'],
    ['Up to 50 players', 'plan.feature.upTo50'],
    ['Club analytics', 'plan.feature.clubAnalytics'],
    ['Unlimited tournaments', 'plan.feature.unlimitedTournaments'],
    ['White-label', 'plan.feature.whiteLabel'],
    ['API access', 'plan.feature.apiAccess']
  ]);
  readonly shownPlans = computed(() => PLAN_CONFIGS.filter(plan => this.audience() === 'b2c' ? ['FREE', 'B2C_BASIC', 'B2C_PRO'].includes(plan.id) : ['B2B_CLUB', 'B2B_PRO'].includes(plan.id)));

  constructor() {
    setInterval(() => this.wordIndex.update(index => (index + 1) % this.wordKeys.length), 1800);
  }

  translatedFeatures(features: string[]): string[] {
    return features.map(feature => this.language.t(this.featureKeyMap.get(feature) ?? feature));
  }

  track(label: string): void {
    this.analytics.track('cta_clicked', {
      cta_label: label,
      page_name: 'landing'
    });
  }
}
