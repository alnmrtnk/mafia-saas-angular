import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { User } from '../models/user.model';

type ConsentChoice = 'accepted' | 'declined';
type AnalyticsEvent = { name: string; properties: Record<string, unknown> };

interface MixpanelClient {
  __SV?: number;
  init: (token: string, config?: Record<string, unknown>, name?: string) => unknown;
  identify: (id: string) => void;
  people: { set: (properties: Record<string, unknown>) => void };
  register: (properties: Record<string, unknown>) => void;
  reset: () => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
}

type MixpanelQueue = unknown[] & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    mixpanel?: MixpanelClient;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly mixpanelToken = '1bb418e92cffca0d4e1d02bf47422aa6';
  private readonly consentStorageKey = 'mafia_analytics_consent';
  private readonly mixpanelMethods = [
    'disable', 'time_event', 'track', 'track_pageview', 'track_links', 'track_forms',
    'register', 'register_once', 'alias', 'unregister', 'identify', 'name_tag',
    'set_config', 'reset'
  ];
  private readonly mixpanelPeopleMethods = [
    'set', 'set_once', 'unset', 'increment', 'append', 'union',
    'track_charge', 'clear_charges', 'delete_user'
  ];

  private router = inject(Router);
  private initialized = false;
  private mixpanelReady = false;
  private routeTrackingStarted = false;
  private currentUser: User | null = null;
  private pendingEvents: AnalyticsEvent[] = [];

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
    if (user) this.identifyCurrentUser();
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
    const event: AnalyticsEvent = {
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
    if (!this.mixpanelReady || !window.mixpanel) {
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
    this.installMixpanelBootstrap();
    window.mixpanel?.init(this.mixpanelToken, {
      debug: false,
      persistence: 'localStorage',
      track_pageview: false
    });
    this.mixpanelReady = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.onload = () => {
      this.identifyCurrentUser();
      this.flushPendingEvents();
    };
    document.head.appendChild(script);
  }

  private installMixpanelBootstrap(): void {
    const existing = window.mixpanel as unknown as { __SV?: number } | undefined;
    if (existing?.__SV) return;

    const root = [] as unknown as MixpanelQueue;
    root['_i'] = [];
    root['__SV'] = 1.2;
    root['init'] = (token: string, config?: Record<string, unknown>, name?: string): MixpanelQueue => {
      const target = name ? this.namedMixpanelQueue(root, name) : root;
      this.installMixpanelMethods(target);
      (root['_i'] as unknown[]).push([token, config ?? {}, name]);
      return target;
    };

    window.mixpanel = root as unknown as MixpanelClient;
  }

  private namedMixpanelQueue(root: MixpanelQueue, name: string): MixpanelQueue {
    if (!root[name]) root[name] = [] as unknown as MixpanelQueue;
    return root[name] as MixpanelQueue;
  }

  private installMixpanelMethods(queue: MixpanelQueue): void {
    for (const method of this.mixpanelMethods) {
      queue[method] = (...args: unknown[]) => {
        queue.push([method, ...args]);
        return queue;
      };
    }

    const people = (queue['people'] ?? []) as MixpanelQueue;
    for (const method of this.mixpanelPeopleMethods) {
      people[method] = (...args: unknown[]) => {
        people.push([method, ...args]);
        return people;
      };
    }
    queue['people'] = people;
  }

  private startRouteTracking(): void {
    if (this.routeTrackingStarted) return;
    this.routeTrackingStarted = true;
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.trackPageView((event as NavigationEnd).urlAfterRedirects);
    });
  }

  private identifyCurrentUser(): void {
    if (!this.currentUser || !this.mixpanelReady || !window.mixpanel) return;
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
    if (!this.mixpanelReady || !window.mixpanel) return;
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
