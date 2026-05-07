import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<main class="missing"><div><span>404</span><h1>The Mafia has silenced this page</h1><a class="btn primary" routerLink="/">Return to the table</a></div></main>`,
  styles: [`.missing{min-height:100vh;display:grid;place-items:center;text-align:center;background:radial-gradient(circle,rgba(201,49,74,.22),transparent 32%),var(--color-bg)}span{font-family:var(--font-display);font-size:8rem;color:var(--color-primary)}h1{font-family:var(--font-display);font-size:clamp(2rem,5vw,4rem)}`]
})
export class NotFoundComponent {}
