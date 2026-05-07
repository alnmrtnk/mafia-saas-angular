import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsService } from './core/services/analytics.service';
import { LanguageService } from './core/services/language.service';
import { StorageService } from './core/services/storage.service';
import { ThemeService } from './core/services/theme.service';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `<app-navbar /><router-outlet /><app-footer /><app-toast />`,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private storage = inject(StorageService);
  private analytics = inject(AnalyticsService);
  private theme = inject(ThemeService);
  private language = inject(LanguageService);

  ngOnInit(): void {
    this.storage.seedIfEmpty();
    this.theme.init();
    this.language.setLanguage(this.language.language());
    this.analytics.init();
  }
}
