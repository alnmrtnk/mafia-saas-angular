import { Injectable, signal } from '@angular/core';
import { GameScenario, GameSession, PlayerRole } from '../models/game.model';
import { LeaderboardEntry, PlayerStatistics } from '../models/statistics.model';
import { Subscription, SubscriptionPlanConfig } from '../models/subscription.model';
import { Tournament } from '../models/tournament.model';
import { User } from '../models/user.model';

type CollectionName = 'users' | 'scenarios' | 'games' | 'tournaments' | 'subscriptions' | 'statistics' | 'leaderboard' | 'invoices';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private prefix = 'mafia_';
  readonly seeded = signal(false);

  seedIfEmpty(): void {
    if (localStorage.getItem(this.key('users'))) {
      this.seeded.set(true);
      return;
    }

    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
    const future = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

    const users: User[] = [
      { id: 'u-john', username: 'john_citizen', email: 'john@mafia.gg', passwordHash: btoa('john'), role: 'B2CUser', avatarUrl: 'JC', createdAt: daysAgo(90), subscriptionId: 'sub-john' },
      { id: 'u-org', username: 'tourOrg', email: 'club@mafia.gg', passwordHash: btoa('club'), role: 'B2BUser', avatarUrl: 'TO', createdAt: daysAgo(60), subscriptionId: 'sub-org', clubName: 'Lviv Mafia Club' },
      { id: 'u-admin', username: 'admin', email: 'admin@mafia.gg', passwordHash: btoa('admin'), role: 'Admin', avatarUrl: 'AD', createdAt: daysAgo(120), subscriptionId: null }
    ];

    const scenarios: GameScenario[] = [
      { id: 'classic', name: 'Classic', minPlayers: 10, maxPlayers: 14, rolesConfig: [{ role: 'Mafia', count: 2 }, { role: 'Don', count: 1 }, { role: 'Doctor', count: 1 }, { role: 'Sheriff', count: 1 }, { role: 'Citizen', count: 9 }] },
      { id: 'advanced', name: 'Advanced', minPlayers: 8, maxPlayers: 12, rolesConfig: [{ role: 'Mafia', count: 2 }, { role: 'Doctor', count: 1 }, { role: 'Sheriff', count: 1 }, { role: 'Citizen', count: 8 }] },
      { id: 'mini', name: 'Mini', minPlayers: 6, maxPlayers: 8, rolesConfig: [{ role: 'Mafia', count: 1 }, { role: 'Doctor', count: 1 }, { role: 'Sheriff', count: 1 }, { role: 'Citizen', count: 5 }] }
    ];

    const botNames = ['Nika', 'Bohdan', 'Marta', 'Oleh', 'Ira', 'Danylo', 'Katya', 'Roman', 'Sofia', 'Taras'];
    const games: GameSession[] = [
      this.completedGame('g-1', 'Classic at midnight', 'classic', daysAgo(22), 'Citizens', botNames),
      this.completedGame('g-2', 'Club table A', 'advanced', daysAgo(18), 'Mafia', botNames),
      this.completedGame('g-3', 'Friday Mini', 'mini', daysAgo(12), 'Citizens', botNames),
      this.completedGame('g-4', 'Lviv qualifier', 'classic', daysAgo(7), 'Citizens', botNames),
      this.completedGame('g-5', 'Ranking rush', 'advanced', daysAgo(2), 'Mafia', botNames),
      { id: 'g-open', name: 'Open Classic Room', scenarioId: 'classic', hostId: 'u-john', status: 'WaitingForPlayers', players: [{ userId: 'u-john', username: 'john_citizen', role: null, isAlive: true, isReady: true }], currentPhase: 0, chatMessages: [{ id: 'm-1', userId: 'system', username: 'System', text: 'Lobby created. Waiting for players.', phase: 'System', timestamp: now.toISOString() }], createdAt: now.toISOString(), completedAt: null, winningSide: null }
    ];

    const subscriptions: Subscription[] = [
      { id: 'sub-john', userId: 'u-john', plan: 'B2C_BASIC', startDate: daysAgo(12), expiresAt: future(18), isActive: true, paymentMethod: 'LiqPay', amount: 149 },
      { id: 'sub-org', userId: 'u-org', plan: 'B2B_CLUB', startDate: daysAgo(8), expiresAt: future(22), isActive: true, paymentMethod: 'Stripe', amount: 599 }
    ];

    const tournaments: Tournament[] = [
      { id: 't-lviv', name: 'Lviv Night Cup', description: 'A ranked city event for ambitious tables.', organizerId: 'u-org', scenarioId: 'classic', status: 'Registration', maxParticipants: 50, participants: ['u-john'], rounds: [], prize: '₴8,000 + champion badge', startDate: future(6), registrationDeadline: future(4), createdAt: daysAgo(4) },
      { id: 't-winter', name: 'Winter Don Finals', description: 'Completed invitational tournament.', organizerId: 'u-org', scenarioId: 'advanced', status: 'Completed', maxParticipants: 32, participants: ['u-john'], rounds: [{ roundNumber: 1, gameSessionId: 'g-4', results: [{ userId: 'u-john', points: 12 }] }], prize: 'Club trophy', startDate: daysAgo(30), registrationDeadline: daysAgo(35), createdAt: daysAgo(45) }
    ];

    const stats: PlayerStatistics[] = [
      { userId: 'u-john', totalGames: 37, wins: 23, losses: 14, winRate: 0.621, favoriteRole: 'Sheriff', averageGameDuration: 42, tournamentsPlayed: 3, tournamentsWon: 1, rank: 4, rating: 1540, roleBreakdown: [{ role: 'Citizen', games: 12, wins: 7 }, { role: 'Mafia', games: 8, wins: 5 }, { role: 'Doctor', games: 6, wins: 3 }, { role: 'Sheriff', games: 9, wins: 7 }, { role: 'Don', games: 2, wins: 1 }], recentGames: Array.from({ length: 10 }, (_, i) => ({ gameId: `g-${(i % 5) + 1}`, date: daysAgo(i + 1), role: ['Citizen', 'Mafia', 'Doctor', 'Sheriff', 'Don'][i % 5] as PlayerRole, won: i % 3 !== 0 })), ratingHistory: [1410, 1430, 1452, 1444, 1480, 1494, 1510, 1502, 1531, 1540] }
    ];

    const leaderboard: LeaderboardEntry[] = ['night_ace', 'sheriff_lviv', 'don_viktor', 'john_citizen', 'marta_moon', 'silent_vote', 'golden_doc', 'red_table', 'katya_clue', 'roman_13'].map((name, index) => ({
      userId: index === 3 ? 'u-john' : `lb-${index}`,
      username: name,
      avatarUrl: name.split('_').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      rating: 1690 - index * 36,
      winRate: .71 - index * .021,
      totalGames: 84 - index * 5,
      favoriteRole: ['Mafia', 'Sheriff', 'Don', 'Sheriff', 'Citizen'][index % 5] as PlayerRole,
      rank: index + 1
    }));

    this.set('users', users);
    this.set('scenarios', scenarios);
    this.set('games', games);
    this.set('tournaments', tournaments);
    this.set('subscriptions', subscriptions);
    this.set('statistics', stats);
    this.set('leaderboard', leaderboard);
    this.set('invoices', []);
    this.seeded.set(true);
  }

  get<T>(collection: CollectionName): T[] {
    return JSON.parse(localStorage.getItem(this.key(collection)) || '[]') as T[];
  }

  set<T>(collection: CollectionName, value: T[]): void {
    localStorage.setItem(this.key(collection), JSON.stringify(value));
  }

  upsert<T extends { id: string }>(collection: CollectionName, item: T): T {
    const items = this.get<T>(collection);
    const index = items.findIndex(existing => existing.id === item.id);
    if (index >= 0) items[index] = item; else items.unshift(item);
    this.set(collection, items);
    return item;
  }

  remove(collection: CollectionName, id: string): void {
    this.set(collection, this.get<{ id: string }>(collection).filter(item => item.id !== id));
  }

  id(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
  }

  private key(collection: CollectionName): string {
    return `${this.prefix}${collection}`;
  }

  private completedGame(id: string, name: string, scenarioId: string, createdAt: string, winningSide: 'Citizens' | 'Mafia', names: string[]): GameSession {
    return {
      id, name, scenarioId, hostId: 'u-org', status: 'Completed', currentPhase: 5, createdAt,
      completedAt: new Date(new Date(createdAt).getTime() + 45 * 60000).toISOString(), winningSide,
      players: names.slice(0, 10).map((username, index) => ({ userId: `bot-${index}`, username, role: ['Citizen', 'Mafia', 'Doctor', 'Sheriff', 'Don'][index % 5] as PlayerRole, isAlive: index % 4 !== 0, isReady: true })),
      chatMessages: [
        { id: `${id}-m1`, userId: 'system', username: 'System', text: 'Roles assigned. Day one begins.', phase: 'System', timestamp: createdAt },
        { id: `${id}-m2`, userId: 'bot-1', username: 'Nika', text: 'That vote moved too fast.', phase: 'Day', timestamp: createdAt }
      ]
    };
  }
}

export const PLAN_CONFIGS: SubscriptionPlanConfig[] = [
  { id: 'FREE', name: 'FREE', price: 0, currency: 'UAH', features: ['5 games/month', 'Basic stats'], gamesPerMonth: 5, tournamentsPerMonth: 0, maxPlayersPerGame: 8, analyticsAccess: false, prioritySupport: false },
  { id: 'B2C_BASIC', name: 'BASIC', price: 149, currency: 'UAH', features: ['Unlimited games', 'Full stats', 'Leaderboard'], gamesPerMonth: null, tournamentsPerMonth: 0, maxPlayersPerGame: 12, analyticsAccess: true, prioritySupport: false },
  { id: 'B2C_PRO', name: 'PRO', price: 299, currency: 'UAH', features: ['Tournaments', 'Priority support', 'Advanced history'], gamesPerMonth: null, tournamentsPerMonth: null, maxPlayersPerGame: 14, analyticsAccess: true, prioritySupport: true },
  { id: 'B2B_CLUB', name: 'CLUB', price: 599, currency: 'UAH', features: ['Tournaments', 'Up to 50 players', 'Club analytics'], gamesPerMonth: null, tournamentsPerMonth: 8, maxPlayersPerGame: 14, analyticsAccess: true, prioritySupport: true },
  { id: 'B2B_PRO', name: 'PRO', price: 1199, currency: 'UAH', features: ['Unlimited tournaments', 'White-label', 'API access'], gamesPerMonth: null, tournamentsPerMonth: null, maxPlayersPerGame: 14, analyticsAccess: true, prioritySupport: true }
];
