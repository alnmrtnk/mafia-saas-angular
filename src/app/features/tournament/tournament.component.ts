import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TournamentService } from '../../core/services/tournament.service';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `<main class="page"><div class="container"><div class="head"><h1 class="section-title">Tournaments</h1>@if (auth.role() === 'B2BUser') { <a class="btn primary" routerLink="/tournament/create">Create Tournament</a> }</div><div class="grid two">@for (t of service.tournaments(); track t.id) { <article class="card tournament"><span class="badge gold">{{ t.status }}</span><h2>{{ t.name }}</h2><p>{{ t.description }}</p><p class="muted">{{ t.startDate | date:'dd.MM.yyyy':'':'uk' }} · {{ t.participants.length }}/{{ t.maxParticipants }} · {{ t.prize }}</p><div class="bracket"><span>Round 1</span><span>Final</span><span>Champion</span></div><button class="btn" (click)="service.toggleRegistration(t.id)">Register / Unregister</button></article> }</div></div></main>`,
  styles: [`.head{display:flex;justify-content:space-between;align-items:center;gap:18px}.tournament{padding:22px}.tournament h2{font-family:var(--font-display)}.bracket{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.bracket span{padding:12px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-2);text-align:center}@media(max-width:760px){.head{align-items:flex-start;flex-direction:column}}`]
})
export class TournamentComponent { readonly service = inject(TournamentService); readonly auth = inject(AuthService); }

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<main class="page"><div class="container create card"><h1 class="section-title">Create Tournament</h1><div class="progress"><i [style.width.%]="(step()+1)*25"></i></div>@if (step() === 0) { <label class="form-field"><span>Name</span><input class="input" [(ngModel)]="name"></label><label class="form-field"><span>Description</span><textarea class="textarea" [(ngModel)]="description"></textarea></label><label class="form-field"><span>Prize</span><input class="input" [(ngModel)]="prize"></label> } @if (step() === 1) { <label class="form-field"><span>Scenario</span><select class="select" [(ngModel)]="scenarioId"><option value="classic">Classic</option><option value="advanced">Advanced</option><option value="mini">Mini</option></select></label><label class="form-field"><span>Max participants</span><input class="input" type="number" [(ngModel)]="maxParticipants"></label> } @if (step() === 2) { <label class="form-field"><span>Start date</span><input class="input" type="date" [(ngModel)]="startDate"></label><label class="form-field"><span>Registration deadline</span><input class="input" type="date" [(ngModel)]="registrationDeadline"></label> } @if (step() === 3) { <h2>Review & Publish</h2><p>{{ name }} · {{ prize }} · {{ maxParticipants }} players</p> }<div class="actions"><button class="btn" (click)="back()">Back</button><button class="btn primary" (click)="next()">{{ step() === 3 ? 'Publish' : 'Next' }}</button></div></div></main>`,
  styles: [`.create{padding:24px;max-width:760px}.progress{height:8px;border-radius:99px;background:var(--color-surface-2);overflow:hidden;margin-bottom:24px}.progress i{display:block;height:100%;background:linear-gradient(90deg,var(--color-primary),var(--color-accent));transition:width var(--transition)}.form-field{margin-bottom:14px}.actions{display:flex;gap:10px;justify-content:flex-end}`]
})
export class TournamentCreateComponent {
  readonly service = inject(TournamentService);
  readonly step = signal(0);
  name = 'City Mafia Cup'; description = 'Ranked club tournament'; prize = '₴5,000'; scenarioId = 'classic'; maxParticipants = 32; startDate = new Date(Date.now() + 86400000 * 7).toISOString().slice(0,10); registrationDeadline = new Date(Date.now() + 86400000 * 5).toISOString().slice(0,10);
  back() { this.step.update(value => Math.max(0, value - 1)); }
  next() { if (this.step() < 3) this.step.update(s => s + 1); else this.service.create({ name: this.name, description: this.description, prize: this.prize, scenarioId: this.scenarioId, maxParticipants: this.maxParticipants, startDate: this.startDate, registrationDeadline: this.registrationDeadline }).subscribe(); }
}
