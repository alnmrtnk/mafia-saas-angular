import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { Tournament } from '../models/tournament.model';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private analytics = inject(AnalyticsService);
  readonly tournaments = signal<Tournament[]>(this.storage.get<Tournament>('tournaments'));

  create(input: Pick<Tournament, 'name' | 'description' | 'scenarioId' | 'maxParticipants' | 'prize' | 'startDate' | 'registrationDeadline'>): Observable<Tournament> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Authentication required');
    const tournament: Tournament = { ...input, id: this.storage.id('t'), organizerId: user.id, status: 'Registration', participants: [], rounds: [], createdAt: new Date().toISOString() };
    return of(this.storage.upsert('tournaments', tournament)).pipe(delay(500), tap(saved => {
      this.tournaments.set(this.storage.get<Tournament>('tournaments'));
      this.analytics.trackEvent('Tournament', 'tournament_created', saved.name);
    }));
  }

  toggleRegistration(tournamentId: string): void {
    const user = this.auth.currentUser();
    if (!user) return;
    const tournaments = this.tournaments();
    const tournament = tournaments.find(item => item.id === tournamentId);
    if (!tournament) return;
    tournament.participants = tournament.participants.includes(user.id) ? tournament.participants.filter(id => id !== user.id) : [...tournament.participants, user.id];
    this.storage.upsert('tournaments', tournament);
    this.tournaments.set(this.storage.get<Tournament>('tournaments'));
  }
}
