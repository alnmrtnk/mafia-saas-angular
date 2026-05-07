import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <button class="lang" type="button" [attr.aria-label]="'nav.language' | t" (click)="language.toggle()">
      <span [class.active]="language.language() === 'en'">EN</span>
      <span [class.active]="language.language() === 'uk'">UA</span>
    </button>
  `,
  styles: [`.lang{min-height:38px;display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface-2);color:var(--color-text-muted)}span{display:grid;place-items:center;min-width:32px;height:30px;border-radius:var(--radius-sm);font-size:.78rem;font-weight:800}.active{background:var(--color-primary);color:white}`]
})
export class LanguageSwitcherComponent {
  readonly language = inject(LanguageService);
}
