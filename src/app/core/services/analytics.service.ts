import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { User } from '../models/user.model';

type ConsentChoice = 'accepted' | 'declined';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    mixpanel?: {
      init: (token: string, config?: Record<string, unknown>) => void;
      identify: (id: string) => void;
      people: { set: (properties: Record<string, unknown>) => void };
      register: (properties: Record<string, unknown>) => void;
      reset: () => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly mixpanelToken = '1bb418e92cffca0d4e1d02bf47422aa6';
  private readonly consentStorageKey = 'mafia_analytics_consent';
  private router = inject(Router);
  private initialized = false;
  private routeTrackingStarted = false;
  private currentUser: User | null = null;
  private pendingEvents: Array<{ name: string; properties: Record<string, unknown> }> = [];

  init(): void {
    if (this.initialized || typeof document === 'undefined' || !this.hasConsent()) return;
    this.initialized = true;
    this.loadGoogleAnalytics();
    this.loadMixpanel();
    this.identifyCurrentUser();
    this.flushPendingEvents();
    this.startRouteTracking();
    this.trackPageView(this.router.url);
  }

  hasConsent(): boolean {
    return typeof localStorage !== 'undefined' && localStorage.getItem(this.consentStorageKey) === 'accepted';
  }

  hasConsentChoice(): boolean {
    return typeof localStorage !== 'undefined' && localStorage.getItem(this.consentStorageKey) !== null;
  }

  acceptTracking(): void {
    localStorage.setItem(this.consentStorageKey, 'accepted' satisfies ConsentChoice);
    this.init();
  }

  declineTracking(): void {
    localStorage.setItem(this.consentStorageKey, 'declined' satisfies ConsentChoice);
    this.pendingEvents = [];
    window.mixpanel?.reset();
  }

  setUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      this.identifyCurrentUser();
    }
  }

  resetUser(): void {
    this.currentUser = null;
    window.mixpanel?.reset();
  }

  trackSignUpCompleted(user: User, signUpMethod = 'email'): void {
    this.setUser(user);
    this.track('sign_up_completed', {
      sign_up_method: signUpMethod,
      platform: 'web',
      user_role: user.role
    });
  }

  trackPageView(path: string): void {
    window.gtag?.('event', 'page_view', { page_path: path });
    this.track('page_view', { page_path: path });
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    this.track(action, {
      event_category: category,
      event_label: label,
      value
    });
  }

  track(name: string, properties: Record<string, unknown> = {}): void {
    const event = {
      name,
      properties: this.cleanProperties({
        ...properties,
        platform: 'web',
        user_role: this.currentUser?.role
      })
    };
    if (!this.initialized) {
      if (this.hasConsent()) this.pendingEvents.push(event);
      return;
    }
    this.trackGoogleAnalyticsEvent(event.name, event.properties);
    if (!window.mixpanel) {
      this.pendingEvents.push(event);
      return;
    }
    window.mixpanel.track(event.name, event.properties);
  }

  private loadGoogleAnalytics(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-EMEV38L18X';
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: unknown[]) { window.dataLayer?.push(args); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-EMEV38L18X');
  }

  private loadMixpanel(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.onload = () => {
      window.mixpanel?.init(this.mixpanelToken, {
        debug: false,
        persistence: 'localStorage',
        track_pageview: false
      });
      this.identifyCurrentUser();
      this.flushPendingEvents();
    };
    document.head.appendChild(script);
  }

  private startRouteTracking(): void {
    if (this.routeTrackingStarted) return;
    this.routeTrackingStarted = true;
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.trackPageView((event as NavigationEnd).urlAfterRedirects);
    });
  }

  private identifyCurrentUser(): void {
    if (!this.currentUser || !window.mixpanel) return;
    window.mixpanel.identify(this.currentUser.id);
    window.mixpanel.people.set(this.cleanProperties({
      $name: this.currentUser.username,
      $email: this.currentUser.email,
      role: this.currentUser.role,
      created_at: this.currentUser.createdAt,
      has_subscription: !!this.currentUser.subscriptionId
    }));
    window.mixpanel.register(this.cleanProperties({
      user_role: this.currentUser.role
    }));
  }

  private flushPendingEvents(): void {
    if (!window.mixpanel) return;
    for (const event of this.pendingEvents) {
      window.mixpanel.track(event.name, event.properties);
    }
    this.pendingEvents = [];
  }

  private trackGoogleAnalyticsEvent(name: string, properties: Record<string, unknown>): void {
    if (name === 'page_view') return;
    window.gtag?.('event', name, properties);
  }

  private cleanProperties(properties: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  }
}
