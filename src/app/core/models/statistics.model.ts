import { PlayerRole } from './game.model';

export interface PlayerStatistics {
  userId: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  favoriteRole: PlayerRole;
  roleBreakdown: { role: PlayerRole; games: number; wins: number }[];
  averageGameDuration: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  rank: number;
  rating: number;
  recentGames: { gameId: string; date: string; role: PlayerRole; won: boolean }[];
  ratingHistory?: number[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string;
  rating: number;
  winRate: number;
  totalGames: number;
  favoriteRole: PlayerRole;
  rank: number;
}
