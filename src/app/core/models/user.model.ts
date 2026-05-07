export type UserRole = 'B2CUser' | 'B2BUser' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  subscriptionId: string | null;
  isBanned?: boolean;
  clubName?: string;
}
