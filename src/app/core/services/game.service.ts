import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { GameScenario, GameSession, GameStatus, PlayerRole } from '../models/game.model';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private analytics = inject(AnalyticsService);
  readonly games = signal<GameSession[]>(this.storage.get<GameSession>('games'));
  readonly scenarios = signal<GameScenario[]>(this.storage.get<GameScenario>('scenarios'));

  refresh(): void {
    this.games.set(this.storage.get<GameSession>('games'));
    this.scenarios.set(this.storage.get<GameScenario>('scenarios'));
  }

  createGame(scenarioId: string, name: string): Observable<GameSession> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Authentication required');
    const players = user.role === 'B2BUser' ? [] : [{ userId: user.id, username: user.username, role: null, isAlive: true, isReady: true }];
    const game: GameSession = { id: this.storage.id('g'), name, scenarioId, hostId: user.id, status: 'WaitingForPlayers', players, currentPhase: 0, chatMessages: [], createdAt: new Date().toISOString(), completedAt: null, winningSide: null, statEvents: [], organizerNotes: '' };
    return of(this.storage.upsert('games', game)).pipe(delay(this.latency()), tap(saved => {
      this.refresh();
      const scenario = this.scenarios().find(s => s.id === scenarioId);
      this.analytics.track('game_created', {
        game_id: saved.id,
        scenario_id: scenarioId,
        scenario_name: scenario?.name,
        host_id: user.id,
        player_count: saved.players.length,
        max_players: scenario?.maxPlayers
      });
    }));
  }

  addManualPlayer(gameId: string, username: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game || !username.trim()) return;
    const userId = this.storage.id('manual');
    game.players.push({ userId, username: username.trim(), role: null, isAlive: true, isReady: true, votes: 0 });
    this.record(game, 'Custom', `Organizer added ${username.trim()} to the table`, undefined, userId);
    this.save(game);
  }

  removePlayer(gameId: string, userId: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    const player = game.players.find(item => item.userId === userId);
    game.players = game.players.filter(item => item.userId !== userId);
    this.record(game, 'Custom', `Organizer removed ${player?.username ?? 'player'} from the table`, undefined, userId);
    this.save(game);
  }

  setPlayerRole(gameId: string, userId: string, role: PlayerRole | null): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    game.players = game.players.map(player => player.userId === userId ? { ...player, role } : player);
    this.record(game, 'Custom', `Role assigned: ${role ?? 'Hidden'}`, undefined, userId);
    this.save(game);
  }

  toggleReady(gameId: string, userId: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    game.players = game.players.map(player => player.userId === userId ? { ...player, isReady: !player.isReady } : player);
    this.save(game);
  }

  toggleAlive(gameId: string, userId: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    const target = game.players.find(player => player.userId === userId);
    game.players = game.players.map(player => player.userId === userId ? { ...player, isAlive: !player.isAlive } : player);
    this.record(game, 'Elimination', `${target?.username ?? 'Player'} alive state changed by organizer`, undefined, userId);
    this.checkWin(game);
    this.save(game);
  }

  setPhase(gameId: string, status: GameStatus): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    const wasCompleted = game.status === 'Completed';
    game.status = status;
    if (status === 'DayPhase' || status === 'NightPhase') game.currentPhase += 1;
    if (status === 'Completed') {
      game.completedAt = new Date().toISOString();
      game.winningSide = game.winningSide ?? 'Citizens';
    }
    this.record(game, 'PhaseChange', `Phase changed to ${status}`);
    if (status === 'Completed' && !wasCompleted) this.trackGameCompleted(game);
    this.save(game);
  }

  setWinner(gameId: string, winningSide: 'Citizens' | 'Mafia'): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    game.status = 'Completed';
    game.completedAt = new Date().toISOString();
    game.winningSide = winningSide;
    this.record(game, 'Custom', `Organizer completed game. Winner: ${winningSide}`);
    this.trackGameCompleted(game);
    this.save(game);
  }

  addStatEvent(gameId: string, note: string, type: 'Vote' | 'Elimination' | 'NightKill' | 'Save' | 'Check' | 'PhaseChange' | 'Custom' = 'Custom', actorUserId?: string, targetUserId?: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game || !note.trim()) return;
    this.record(game, type, note.trim(), actorUserId, targetUserId);
    this.save(game);
  }

  setOrganizerNotes(gameId: string, notes: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    game.organizerNotes = notes;
    this.save(game);
  }

  joinGame(gameId: string): Observable<GameSession> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Authentication required');
    const game = this.games().find(item => item.id === gameId);
    if (!game) throw new Error('Game not found');
    if (!game.players.some(player => player.userId === user.id)) {
      game.players.push({ userId: user.id, username: user.username, role: null, isAlive: true, isReady: false });
    }
    return of(this.storage.upsert('games', game)).pipe(delay(this.latency()), tap(saved => {
      this.refresh();
      this.analytics.track('game_joined', {
        game_id: saved.id,
        scenario_id: saved.scenarioId,
        player_count: saved.players.length
      });
    }));
  }

  startGame(gameId: string): Observable<GameSession> {
    const game = this.games().find(item => item.id === gameId);
    if (!game) throw new Error('Game not found');
    const scenario = this.scenarios().find(item => item.id === game.scenarioId)!;
    const roles = scenario.rolesConfig.flatMap(config => Array.from({ length: config.count }, () => config.role));
    game.status = 'DayPhase';
    game.currentPhase = 1;
    game.players = game.players.map((player, index) => ({ ...player, role: roles[index] ?? 'Citizen', isAlive: true, isReady: true, votes: 0 }));
    game.chatMessages.push({ id: this.storage.id('msg'), userId: 'system', username: 'System', text: 'The table wakes up. Day phase begins.', phase: 'System', timestamp: new Date().toISOString() });
    return of(this.storage.upsert('games', game)).pipe(delay(this.latency()), tap(saved => {
      this.refresh();
      this.analytics.track('game_started', {
        game_id: saved.id,
        scenario_id: saved.scenarioId,
        player_count: saved.players.length,
        role_count: roles.length
      });
    }));
  }

  vote(gameId: string, userId: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    game.players = game.players.map(player => player.userId === userId ? { ...player, votes: (player.votes ?? 0) + 1 } : player);
    this.record(game, 'Vote', 'Vote registered', undefined, userId);
    this.save(game);
  }

  simulateNight(gameId: string): void {
    const game = this.games().find(item => item.id === gameId);
    if (!game) return;
    game.status = 'NightPhase';
    game.currentPhase += 1;
    setTimeout(() => {
      const aliveCitizens = game.players.filter(player => player.isAlive && !['Mafia', 'Don'].includes(player.role ?? 'Citizen'));
      const victim = aliveCitizens[0];
      if (victim) victim.isAlive = false;
      game.status = 'DayPhase';
      game.currentPhase += 1;
      this.checkWin(game);
      this.record(game, 'NightKill', `${victim?.username ?? 'No one'} was selected during night`, undefined, victim?.userId);
      this.save(game);
    }, 1200);
  }

  checkWin(game: GameSession): void {
    const mafia = game.players.filter(player => player.isAlive && ['Mafia', 'Don'].includes(player.role ?? '')).length;
    const citizens = game.players.filter(player => player.isAlive && !['Mafia', 'Don'].includes(player.role ?? '')).length;
    if (mafia === 0 || mafia >= citizens) {
      game.status = 'Completed';
      game.completedAt = new Date().toISOString();
      game.winningSide = mafia === 0 ? 'Citizens' : 'Mafia';
      this.trackGameCompleted(game);
    }
  }

  roleColor(role: PlayerRole | null): string {
    return role === 'Mafia' ? 'red' : role === 'Don' ? 'gold' : role === 'Doctor' ? 'green' : role === 'Sheriff' ? 'blue' : '';
  }

  private latency(): number {
    return 300 + Math.round(Math.random() * 400);
  }

  private record(game: GameSession, type: 'Vote' | 'Elimination' | 'NightKill' | 'Save' | 'Check' | 'PhaseChange' | 'Custom', note: string, actorUserId?: string, targetUserId?: string): void {
    game.statEvents = [...(game.statEvents ?? []), { id: this.storage.id('stat'), type, actorUserId, targetUserId, note, phase: game.currentPhase, timestamp: new Date().toISOString() }];
  }

  private save(game: GameSession): void {
    this.storage.upsert('games', game);
    this.refresh();
  }

  private trackGameCompleted(game: GameSession): void {
    this.analytics.track('game_completed', {
      game_id: game.id,
      scenario_id: game.scenarioId,
      player_count: game.players.length,
      phase_count: game.currentPhase,
      winning_side: game.winningSide,
      stat_event_count: game.statEvents?.length ?? 0
    });
  }
}
