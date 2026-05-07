import { Component, inject } from '@angular/core';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [LucideAngularModule],
  template: `<button class="icon-btn" type="button" aria-label="Toggle theme" (click)="theme.toggle()"><lucide-icon [img]="theme.theme() === 'dark' ? Sun : Moon" size="18"></lucide-icon></button>`,
  styles: [`.icon-btn{width:42px;height:42px;border-radius:var(--radius-md);border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-text);display:grid;place-items:center}.icon-btn:hover{border-color:rgba(240,165,0,.45);color:var(--color-accent)}`]
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
  readonly Sun = Sun;
  readonly Moon = Moon;
}
