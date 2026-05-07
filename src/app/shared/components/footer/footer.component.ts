import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container foot">
        <strong>Mafia SaaS</strong>
        <nav>
          <a routerLink="/">About</a>
          <a routerLink="/subscription">Pricing</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`.footer{border-top:1px solid var(--color-border);padding:28px 0;color:var(--color-text-muted);background:var(--color-surface)}.foot{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}.footer strong{font-family:var(--font-display);color:var(--color-text)}nav{display:flex;gap:16px;flex-wrap:wrap}a:hover{color:var(--color-accent)}`]
})
export class FooterComponent {}
