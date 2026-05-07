import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Moon, Plus, Skull, Trash2, UserPlus, Vote } from 'lucide-angular';
import { GameStatus, PlayerRole } from '../../core/models/game.model';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { RoleColorPipe } from '../../shared/pipes/role-color.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, ModalComponent, RoleColorPipe, TranslatePipe],
  template: `
    <main class="page">
      <div class="container">
        @if (!selectedGame()) {
          <div class="head">
            <h1 class="section-title">{{ 'game.rooms' | t }}</h1>
            <button class="btn primary" type="button" (click)="modal.set(true)"><lucide-icon [img]="Plus" size="18"></lucide-icon>{{ 'game.create' | t }}</button>
          </div>
          <div class="filters">
            <select class="select" [(ngModel)]="scenarioFilter" aria-label="Filter by scenario">
              <option value="">{{ 'game.allScenarios' | t }}</option>
              @for (s of game.scenarios(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
            </select>
          </div>
          <div class="grid three">
            @for (room of filteredGames(); track room.id) {
              <article class="card room">
                <span class="badge green">{{ room.status }}</span>
                <h2>{{ room.name }}</h2>
                <p class="muted">{{ scenario(room.scenarioId)?.name }} · {{ room.players.length }}/{{ scenario(room.scenarioId)?.maxPlayers }}</p>
                <button class="btn primary" type="button" (click)="join(room.id)">{{ 'game.join' | t }}</button>
                <a class="btn" [routerLink]="['/game', room.id, 'lobby']">{{ 'game.lobby' | t }}</a>
              </article>
            }
          </div>
        } @else if (mode() === 'lobby') {
          <section class="card lobby">
            <div class="lobby-head">
              <div>
                <h1>{{ selectedGame()?.name }}</h1>
                <p class="muted">{{ canManage() ? ('game.lobbyHostHint' | t) : ('game.lobbyPlayerHint' | t) }}</p>
              </div>
              <span class="badge gold">{{ selectedGame()?.players?.length ?? 0 }} {{ 'game.players' | t }}</span>
            </div>

            @if (canManage()) {
              <aside class="manager card">
                <h2>{{ 'game.tableSetup' | t }}</h2>
                <p class="muted">{{ 'game.tableSetupHint' | t }}</p>
                <div class="add-row">
                  <input class="input" [placeholder]="'game.playerNamePlaceholder' | t" [(ngModel)]="manualPlayerName" (keyup.enter)="addManualPlayer()">
                  <button class="btn primary" type="button" (click)="addManualPlayer()"><lucide-icon [img]="UserPlus" size="16"></lucide-icon>{{ 'game.addPlayer' | t }}</button>
                </div>
              </aside>
            }

            <div class="players">
              @for (p of selectedGame()?.players ?? []; track p.userId) {
                <div>
                  <span class="avatar">{{ p.username.slice(0,2).toUpperCase() }}</span>
                  <b>{{ p.username }}</b>
                  <span class="badge" [class.green]="p.isReady">{{ p.isReady ? ('game.ready' | t) : ('game.waiting' | t) }}</span>
                  @if (canManage()) {
                    <button class="mini" type="button" [title]="'game.toggleReady' | t" (click)="toggleReady(p.userId)">{{ 'game.toggleReady' | t }}</button>
                    <button class="mini danger" type="button" title="Remove player from this table" (click)="removePlayer(p.userId)"><lucide-icon [img]="Trash2" size="14"></lucide-icon></button>
                  }
                </div>
              } @empty {
                <p class="empty muted">{{ 'game.emptyPlayers' | t }}</p>
              }
            </div>

            <div class="chat">
              @for (m of selectedGame()?.chatMessages ?? []; track m.id) { <p><b>{{ m.username }}:</b> {{ m.text }}</p> }
            </div>
            <button class="btn primary" type="button" (click)="start()">{{ 'game.startGame' | t }}</button>
          </section>
        } @else {
          <section class="play" [class.night]="selectedGame()?.status === 'NightPhase'">
            <header class="play-head">
              <div>
                <h1>{{ selectedGame()?.status }}</h1>
                <p class="muted">{{ canManage() ? nextStepHint() : ('game.playerPhaseHint' | t) }}</p>
              </div>
              <div class="head-actions">
                <span class="badge gold">{{ 'game.phase' | t }} {{ selectedGame()?.currentPhase }}</span>
                <button class="btn gold" type="button" (click)="night()"><lucide-icon [img]="Moon" size="18"></lucide-icon>{{ 'game.simulateNight' | t }}</button>
              </div>
            </header>

            @if (myRole(); as role) {
              <div class="reveal card"><span>{{ 'game.yourRole' | t }}</span><b [class]="role | roleColor">{{ role }}</b></div>
            }

            @if (canManage()) {
              <section class="organizer-console">
                <article class="card command-panel">
                  <div class="panel-head">
                    <span class="badge gold">{{ 'game.hostMode' | t }}</span>
                    <h2>{{ 'game.runTable' | t }}</h2>
                    <p>{{ nextStepHint() }}</p>
                  </div>
                  <div class="score-strip">
                    <span><b>{{ aliveCount() }}</b>{{ 'game.alive' | t }}</span>
                    <span><b>{{ mafiaCount() }}</b>{{ 'game.mafia' | t }}</span>
                    <span><b>{{ citizenCount() }}</b>{{ 'game.citizens' | t }}</span>
                    <span><b>{{ selectedGame()?.statEvents?.length ?? 0 }}</b>{{ 'game.events' | t }}</span>
                  </div>
                  <div class="phase-controls" aria-label="Phase controls">
                    <button class="btn" type="button" (click)="setPhase('DayPhase')">{{ 'game.startDay' | t }}</button>
                    <button class="btn" type="button" (click)="setPhase('NightPhase')">{{ 'game.startNight' | t }}</button>
                    <button class="btn gold" type="button" (click)="setWinner('Citizens')">{{ 'game.citizensWin' | t }}</button>
                    <button class="btn primary" type="button" (click)="setWinner('Mafia')">{{ 'game.mafiaWin' | t }}</button>
                  </div>
                </article>

                <article class="card stat-recorder">
                  <h2>{{ 'game.recordEvent' | t }}</h2>
                  <p class="muted">{{ 'game.recordEventHint' | t }}</p>
                  <div class="stat-form">
                    <label><span>{{ 'game.type' | t }}</span><select class="select" [(ngModel)]="statType">@for (type of statTypes; track type) { <option [value]="type">{{ type }}</option> }</select></label>
                    <label class="wide"><span>{{ 'game.note' | t }}</span><input class="input" [(ngModel)]="statNote" [placeholder]="'game.notePlaceholder' | t" (keyup.enter)="addStatEvent()"></label>
                    <button class="btn primary" type="button" (click)="addStatEvent()">{{ 'game.record' | t }}</button>
                  </div>
                  <label class="notes">
                    <span>{{ 'game.privateNotes' | t }}</span>
                    <textarea class="textarea" [(ngModel)]="organizerNotes" (blur)="saveNotes()" [placeholder]="'game.privateNotesPlaceholder' | t"></textarea>
                  </label>
                </article>
              </section>
            }

            <div class="player-grid">
              @for (p of selectedGame()?.players ?? []; track p.userId) {
                <article class="card player" [class.dead]="!p.isAlive">
                  <span class="avatar">{{ p.username.slice(0,2).toUpperCase() }}</span>
                  <h3>{{ p.username }}</h3>
                  @if (canManage()) {
                    <label class="role-field"><span>{{ 'game.role' | t }}</span><select class="select role-select" [ngModel]="p.role" (ngModelChange)="setRole(p.userId, $event)"><option [ngValue]="null">{{ 'game.hidden' | t }}</option>@for (role of roles; track role) { <option [ngValue]="role">{{ role }}</option> }</select></label>
                    <button class="btn" type="button" (click)="toggleAlive(p.userId)">{{ p.isAlive ? ('game.markEliminated' | t) : ('game.revive' | t) }}</button>
                  } @else {
                    <span class="badge" [class]="p.role | roleColor">{{ p.role ?? ('game.hidden' | t) }}</span>
                  }
                  <button class="btn" type="button" (click)="vote(p.userId)"><lucide-icon [img]="Vote" size="16"></lucide-icon>{{ 'game.vote' | t }} {{ p.votes ?? 0 }}</button>
                  @if (!p.isAlive) { <lucide-icon [img]="Skull" class="skull"></lucide-icon> }
                </article>
              }
            </div>

            @if (canManage()) {
              <section class="card stat-log">
                <div class="log-head"><h2>{{ 'game.matchLog' | t }}</h2><span class="muted">{{ 'game.newestFirst' | t }}</span></div>
                @for (event of recentEvents(); track event.id) {
                  <p><span class="badge blue">{{ event.type }}</span><span>{{ 'game.phase' | t }} {{ event.phase }}</span><b>{{ event.note }}</b></p>
                } @empty {
                  <p class="muted">{{ 'game.noEvents' | t }}</p>
                }
              </section>
            }

            @if (selectedGame()?.status === 'Completed') {
              <section class="result card"><span class="badge gold">{{ 'game.completed' | t }}</span><h2>{{ selectedGame()?.winningSide }} win</h2><p class="muted">{{ 'game.resultSaved' | t }}</p></section>
            }
          </section>
        }
      </div>
    </main>

    <app-modal [open]="modal()" title="Create game" (closed)="modal.set(false)">
      <form class="create" (ngSubmit)="create()">
        <label class="form-field"><span>{{ 'game.name' | t }}</span><input class="input" [(ngModel)]="gameName" name="name"></label>
        <label class="form-field"><span>{{ 'game.scenario' | t }}</span><select class="select" [(ngModel)]="scenarioId" name="scenario">@for (s of game.scenarios(); track s.id) { <option [value]="s.id">{{ s.name }} ({{ s.minPlayers }}-{{ s.maxPlayers }})</option> }</select></label>
        <button class="btn primary block">{{ 'game.create' | t }}</button>
      </form>
    </app-modal>
  `,
  styles: [`
    .head,.lobby-head,.play-head{display:flex;justify-content:space-between;align-items:center;gap:18px}.head-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.filters{margin:12px 0 18px;width:min(280px,100%)}.room,.lobby{padding:20px}.room h2,.lobby h1,.command-panel h2,.stat-recorder h2,.stat-log h2,.result h2{font-family:var(--font-display)}.players{display:grid;gap:10px;margin:18px 0}.players div{display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--color-border)}.empty{padding:18px;border:1px dashed var(--color-border);border-radius:var(--radius-md);text-align:center}.avatar{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--color-primary);color:white;font-weight:800}.mini{border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-2);color:var(--color-text);padding:6px 9px}.mini.danger{color:#ff9daf}.manager{padding:18px;margin:18px 0}.manager h2{margin:0 0 8px;font-family:var(--font-display)}.add-row{display:flex;gap:10px;flex-wrap:wrap}.add-row .input{flex:1 1 220px}.chat{background:var(--color-surface-2);border-radius:var(--radius-md);padding:14px;margin-bottom:16px}.play{min-height:calc(100vh - 130px);position:relative}.play.night:before{content:'';position:fixed;inset:76px 0 0;background:radial-gradient(circle at 80% 12%,rgba(240,165,0,.15),transparent 10%),rgba(0,0,0,.62);pointer-events:none;z-index:0}.play>*{position:relative;z-index:1}.play-head h1{margin:0;font-family:var(--font-display)}.organizer-console{display:grid;grid-template-columns:minmax(320px,.9fr) minmax(360px,1.1fr);gap:16px;margin:18px 0}.command-panel,.stat-recorder,.stat-log,.result{padding:18px}.panel-head p{margin:8px 0 0;color:var(--color-text-muted)}.score-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}.score-strip span{padding:10px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-2);color:var(--color-text-muted)}.score-strip b{display:block;color:var(--color-text);font-family:var(--font-display);font-size:1.5rem}.phase-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.stat-form{display:grid;grid-template-columns:160px minmax(220px,1fr) auto;gap:10px;align-items:end}.stat-form label,.notes,.role-field{display:grid;gap:7px}.stat-form span,.notes span,.role-field span{font-size:.76rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}.notes{margin-top:12px}.notes .textarea{min-height:82px}.player-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;margin-top:18px}.player{position:relative;padding:18px;text-align:center;display:grid;gap:10px;justify-items:center}.role-select{max-width:180px}.player.dead{filter:grayscale(1);opacity:.55}.skull{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);color:var(--color-primary);width:52px;height:52px}.reveal{margin:18px 0;padding:18px;text-align:center;perspective:800px;animation:pulse-ring 1.8s infinite}.reveal b{display:block;font-family:var(--font-display);font-size:2.4rem}.red{color:#ff8da0}.gold{color:var(--color-accent)}.green{color:#9be3bd}.blue{color:#9fc2ff}.stat-log{max-height:360px;overflow:auto;margin:18px 0}.log-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.stat-log p{display:grid;grid-template-columns:auto 80px 1fr;gap:10px;align-items:center;margin:10px 0}.stat-log b{font-weight:600}.result{position:static;margin:18px auto 0;text-align:center;width:min(520px,100%);border-color:rgba(240,165,0,.45)}.result h2{margin:10px 0}.create{padding:20px}
    @media(max-width:960px){.organizer-console{grid-template-columns:1fr}.stat-form{grid-template-columns:1fr}.score-strip{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:720px){.head,.lobby-head,.play-head,.players div{align-items:flex-start;flex-direction:column}.add-row,.phase-controls{display:grid}.stat-log p{grid-template-columns:1fr}.stat-form .select{width:100%}}
  `]
})
export class GameComponent {
  readonly game = inject(GameService);
  readonly auth = inject(AuthService);
  private language = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly Plus = Plus;
  readonly Vote = Vote;
  readonly Moon = Moon;
  readonly Skull = Skull;
  readonly Trash2 = Trash2;
  readonly UserPlus = UserPlus;
  readonly modal = signal(false);
  readonly roles: PlayerRole[] = ['Citizen', 'Mafia', 'Doctor', 'Sheriff', 'Don'];
  readonly statTypes = ['Vote', 'Elimination', 'NightKill', 'Save', 'Check', 'PhaseChange', 'Custom'] as const;
  scenarioFilter = '';
  scenarioId = 'classic';
  gameName = 'New Mafia Table';
  manualPlayerName = '';
  statType: typeof this.statTypes[number] = 'Custom';
  statNote = '';
  organizerNotes = '';
  readonly mode = computed(() => this.route.snapshot.url.at(-1)?.path ?? 'list');
  readonly selectedGame = computed(() => this.game.games().find(g => g.id === this.route.snapshot.paramMap.get('id')) ?? null);
  readonly filteredGames = computed(() => this.game.games().filter(g => g.status === 'WaitingForPlayers' && (!this.scenarioFilter || g.scenarioId === this.scenarioFilter)));
  readonly myRole = computed(() => this.selectedGame()?.players[0]?.role ?? null);
  readonly canManage = computed(() => {
    const user = this.auth.currentUser();
    const game = this.selectedGame();
    return !!user && !!game && (user.role === 'B2BUser' || user.role === 'Admin' || game.hostId === user.id);
  });
  readonly aliveCount = computed(() => this.selectedGame()?.players.filter(player => player.isAlive).length ?? 0);
  readonly mafiaCount = computed(() => this.selectedGame()?.players.filter(player => player.isAlive && ['Mafia', 'Don'].includes(player.role ?? '')).length ?? 0);
  readonly citizenCount = computed(() => this.selectedGame()?.players.filter(player => player.isAlive && !['Mafia', 'Don'].includes(player.role ?? '')).length ?? 0);
  readonly recentEvents = computed(() => [...(this.selectedGame()?.statEvents ?? [])].reverse().slice(0, 8));
  readonly nextStepHint = computed(() => {
    const game = this.selectedGame();
    if (!game) return this.language.t('hint.openRoom');
    if (game.status === 'Completed') return this.language.t('hint.completed');
    if (game.players.length === 0) return this.language.t('hint.addPlayers');
    if (game.players.some(player => !player.role)) return this.language.t('hint.assignRoles');
    if (game.status === 'NightPhase') return this.language.t('hint.night');
    return this.language.t('hint.day');
  });

  scenario(id: string) { return this.game.scenarios().find(s => s.id === id); }
  join(id: string) { this.game.joinGame(id).subscribe(() => this.router.navigate(['/game', id, 'lobby'])); }
  create() { this.game.createGame(this.scenarioId, this.gameName).subscribe(room => { this.modal.set(false); this.router.navigate(['/game', room.id, 'lobby']); }); }
  start() { const id = this.selectedGame()?.id; if (id) this.game.startGame(id).subscribe(() => this.router.navigate(['/game', id, 'play'])); }
  vote(id: string) { const game = this.selectedGame(); if (game) this.game.vote(game.id, id); }
  night() { const game = this.selectedGame(); if (game) this.game.simulateNight(game.id); }
  addManualPlayer() { const game = this.selectedGame(); if (game) { this.game.addManualPlayer(game.id, this.manualPlayerName); this.manualPlayerName = ''; } }
  removePlayer(userId: string) { const game = this.selectedGame(); if (game) this.game.removePlayer(game.id, userId); }
  toggleReady(userId: string) { const game = this.selectedGame(); if (game) this.game.toggleReady(game.id, userId); }
  toggleAlive(userId: string) { const game = this.selectedGame(); if (game) this.game.toggleAlive(game.id, userId); }
  setRole(userId: string, role: PlayerRole | null) { const game = this.selectedGame(); if (game) this.game.setPlayerRole(game.id, userId, role); }
  setPhase(status: Extract<GameStatus, 'DayPhase' | 'NightPhase'>) { const game = this.selectedGame(); if (game) this.game.setPhase(game.id, status); }
  setWinner(winner: 'Citizens' | 'Mafia') { const game = this.selectedGame(); if (game) this.game.setWinner(game.id, winner); }
  addStatEvent() { const game = this.selectedGame(); if (game) { this.game.addStatEvent(game.id, this.statNote, this.statType); this.statNote = ''; } }
  saveNotes() { const game = this.selectedGame(); if (game) this.game.setOrganizerNotes(game.id, this.organizerNotes); }
}
