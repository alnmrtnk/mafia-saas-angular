import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private router = inject(Router);
  private initialized = false;

  init(): void {
    if (this.initialized || typeof document === 'undefined') return;
    this.initialized = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MOCK123456';
    document.head.appendChild(script);
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() { (window as any).dataLayer.push(arguments); };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', 'G-MOCK123456');
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.trackPageView((event as NavigationEnd).urlAfterRedirects);
    });
  }

  trackPageView(path: string): void {
    (window as any).gtag?.('event', 'page_view', { page_path: path });
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    (window as any).gtag?.('event', action, { event_category: category, event_label: label, value });
  }
}
