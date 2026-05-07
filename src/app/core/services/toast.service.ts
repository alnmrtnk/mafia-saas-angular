import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(type: Toast['type'], message: string): void {
    const toast = { id: crypto.randomUUID(), type, message };
    this.toasts.update(items => [...items, toast]);
    setTimeout(() => this.dismiss(toast.id), 4000);
  }

  dismiss(id: string): void {
    this.toasts.update(items => items.filter(toast => toast.id !== id));
  }
}
