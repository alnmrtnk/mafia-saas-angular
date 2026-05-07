import { Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>((localStorage.getItem('mafia_theme') as Theme) || 'dark');

  init(): void {
    this.apply(this.theme());
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem('mafia_theme', theme);
    document.documentElement.dataset['theme'] = theme;
  }
}
