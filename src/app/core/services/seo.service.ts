import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface SeoData {
  title: string;
  description: string;
  robots?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);
  private readonly siteUrl = 'https://alnmrtnk.github.io/mafia-saas-angular';
  private readonly fallback: SeoData = {
    title: 'Mafia SaaS - Online Mafia Game Platform for Players and Clubs',
    description: 'Play Mafia online, host club games, manage tournaments, assign roles, track results, and view player statistics with Mafia SaaS.',
    robots: 'index, follow'
  };

  init(): void {
    this.apply(this.currentSeoData(), this.router.url);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const nav = event as NavigationEnd;
      this.apply(this.currentSeoData(), nav.urlAfterRedirects);
    });
  }

  private currentSeoData(): SeoData {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (route?.firstChild) route = route.firstChild;
    return { ...this.fallback, ...(route?.data['seo'] as Partial<SeoData> | undefined) };
  }

  private apply(data: SeoData, path: string): void {
    const url = `${this.siteUrl}${path === '/' ? '/' : path}`;
    this.title.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ name: 'robots', content: data.robots ?? 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.updateCanonical(url);
  }

  private updateCanonical(url: string): void {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }
}
