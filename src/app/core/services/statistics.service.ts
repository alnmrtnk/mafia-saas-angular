import { inject, Injectable, signal } from '@angular/core';
import { LeaderboardEntry, PlayerStatistics } from '../models/statistics.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private storage = inject(StorageService);
  readonly statistics = signal<PlayerStatistics[]>(this.storage.get<PlayerStatistics>('statistics'));
  readonly leaderboard = signal<LeaderboardEntry[]>(this.storage.get<LeaderboardEntry>('leaderboard'));

  forUser(userId: string): PlayerStatistics | null {
    return this.statistics().find(item => item.userId === userId) ?? null;
  }
}
