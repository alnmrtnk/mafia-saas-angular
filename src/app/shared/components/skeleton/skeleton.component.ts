import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div class="skeleton" [class]="type()">@for (row of rowsArray(); track row) { <span></span> }</div>`,
  styles: [`.skeleton{display:grid;gap:10px}.skeleton span{display:block;height:18px;border-radius:var(--radius-sm);background:linear-gradient(90deg,var(--color-surface-2),var(--color-surface-offset),var(--color-surface-2));background-size:220px 100%;animation:shimmer 1.2s infinite}.card span{height:76px}.avatar span{width:54px;height:54px;border-radius:50%}.chart span{height:220px;border-radius:var(--radius-lg)}`]
})
export class SkeletonComponent {
  readonly rows = input(3);
  readonly type = input<'card' | 'table-row' | 'avatar' | 'chart'>('card');
  rowsArray(): number[] { return Array.from({ length: this.rows() }, (_, index) => index); }
}
