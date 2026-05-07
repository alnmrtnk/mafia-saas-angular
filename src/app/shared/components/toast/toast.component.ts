import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { slideInRight } from '../../animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  animations: [slideInRight],
  template: `<div class="toasts">@for (toast of toasts.toasts(); track toast.id) { <button type="button" class="toast" [class]="toast.type" @slideInRight (click)="toasts.dismiss(toast.id)">{{ toast.message }}</button> }</div>`,
  styles: [`.toasts{position:fixed;z-index:80;top:88px;right:18px;display:grid;gap:10px}.toast{max-width:340px;text-align:left;border:1px solid var(--color-border);border-radius:var(--radius-md);padding:13px 15px;color:var(--color-text);background:var(--color-surface);box-shadow:var(--shadow-card)}.success{border-color:rgba(61,170,110,.5)}.error{border-color:rgba(201,49,74,.6)}.warning{border-color:rgba(224,123,48,.55)}.info{border-color:rgba(61,127,224,.55)}`]
})
export class ToastComponent {
  readonly toasts = inject(ToastService);
}
