import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="closed.emit()">
        <section class="modal" role="dialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
          <header><h2>{{ title() }}</h2><button type="button" aria-label="Close modal" (click)="closed.emit()">×</button></header>
          <ng-content />
        </section>
      </div>
    }
  `,
  styles: [`.backdrop{position:fixed;z-index:70;inset:0;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.62);backdrop-filter:blur(8px)}.modal{width:min(620px,100%);max-height:90vh;overflow:auto;border:1px solid var(--color-border);border-radius:var(--radius-lg);background:var(--color-surface);box-shadow:var(--shadow-card);animation:modal-in .22s ease-out}header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--color-border)}h2{margin:0;font-family:var(--font-display)}button{border:0;background:transparent;color:var(--color-text);font-size:1.7rem}@keyframes modal-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`]
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('Dialog');
  readonly closed = output<void>();
}
