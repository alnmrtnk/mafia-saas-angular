export type TournamentStatus = 'Draft' | 'Registration' | 'InProgress' | 'Completed';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  scenarioId: string;
  status: TournamentStatus;
  maxParticipants: number;
  participants: string[];
  rounds: TournamentRound[];
  prize: string;
  startDate: string;
  registrationDeadline: string;
  createdAt: string;
}

export interface TournamentRound {
  roundNumber: number;
  gameSessionId: string;
  results: { userId: string; points: number }[];
}
