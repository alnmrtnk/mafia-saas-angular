export type SubscriptionPlan = 'FREE' | 'B2C_BASIC' | 'B2C_PRO' | 'B2B_CLUB' | 'B2B_PRO';

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: 'UAH';
  features: string[];
  gamesPerMonth: number | null;
  tournamentsPerMonth: number | null;
  maxPlayersPerGame: number;
  analyticsAccess: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  startDate: string;
  expiresAt: string;
  isActive: boolean;
  paymentMethod: 'LiqPay' | 'Stripe' | 'Trial';
  amount: number;
}

export interface Invoice {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: 'UAH';
  createdAt: string;
  provider: 'LiqPay' | 'Stripe';
}
