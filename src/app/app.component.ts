import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AnalyticsService } from './core/services/analytics.service';
import { LanguageService } from './core/services/language.service';
import { SeoService } from './core/services/seo.service';
import { StorageService } from './core/services/storage.service';
import { ThemeService } from './core/services/theme.service';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <app-navbar />
    <router-outlet />
    <app-footer />
    <app-toast />
    @if (!analytics.hasConsentChoice()) {
      <section class="consent" aria-label="Analytics consent">
        <div>
          <strong>Analytics</strong>
          <span>Help improve Mafia SaaS with privacy-conscious usage analytics.</span>
        </div>
        <div class="consent-actions">
          <button class="btn" type="button" (click)="analytics.declineTracking()">Decline</button>
          <button class="btn primary" type="button" (click)="analytics.acceptTracking()">Accept</button>
        </div>
      </section>
    }
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private storage = inject(StorageService);
  readonly analytics = inject(AnalyticsService);
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private language = inject(LanguageService);
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.storage.seedIfEmpty();
    this.theme.init();
    this.language.setLanguage(this.language.language());
    this.seo.init();
    this.analytics.setUser(this.auth.currentUser());
    this.analytics.init();
  }
}
