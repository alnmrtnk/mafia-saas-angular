export type GameStatus = 'WaitingForPlayers' | 'Starting' | 'DayPhase' | 'NightPhase' | 'Completed' | 'Cancelled';
export type PlayerRole = 'Citizen' | 'Mafia' | 'Doctor' | 'Sheriff' | 'Don';

export interface GameScenario {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  rolesConfig: { role: PlayerRole; count: number }[];
}

export interface GameSession {
  id: string;
  name: string;
  scenarioId: string;
  hostId: string;
  status: GameStatus;
  players: GamePlayer[];
  currentPhase: number;
  chatMessages: ChatMessage[];
  createdAt: string;
  completedAt: string | null;
  winningSide: 'Citizens' | 'Mafia' | null;
  statEvents?: GameStatEvent[];
  organizerNotes?: string;
}

export interface GamePlayer {
  userId: string;
  username: string;
  role: PlayerRole | null;
  isAlive: boolean;
  isReady: boolean;
  votes?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  phase: 'Lobby' | 'Day' | 'Night' | 'System';
  timestamp: string;
}

export interface GameStatEvent {
  id: string;
  type: 'Vote' | 'Elimination' | 'NightKill' | 'Save' | 'Check' | 'PhaseChange' | 'Custom';
  actorUserId?: string;
  targetUserId?: string;
  note: string;
  phase: number;
  timestamp: string;
}
