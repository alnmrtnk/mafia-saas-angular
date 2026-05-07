import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    data: { seo: { title: 'Mafia SaaS - Play Mafia Online With Friends and Clubs', description: 'Play Mafia online, host club tables, manage roles, track votes, run tournaments, and follow player statistics in one premium social deduction platform.' } },
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  { path: 'auth/login', data: { seo: { title: 'Login - Mafia SaaS', description: 'Log in to Mafia SaaS to join games, manage club tables, and view player statistics.', robots: 'noindex, follow' } }, loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/register', data: { seo: { title: 'Create Account - Mafia SaaS', description: 'Create a Mafia SaaS account to play online Mafia games or host club tables and tournaments.' } }, loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'dashboard', canActivate: [authGuard], data: { seo: { title: 'Dashboard - Mafia SaaS', description: 'Private player dashboard for Mafia SaaS.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'game', canActivate: [authGuard], data: { seo: { title: 'Game Rooms - Mafia SaaS', description: 'Join or host Mafia game rooms in Mafia SaaS.', robots: 'noindex, follow' } }, loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent) },
  { path: 'game/:id/lobby', canActivate: [authGuard], data: { seo: { title: 'Game Lobby - Mafia SaaS', description: 'Private Mafia SaaS game lobby.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent) },
  { path: 'game/:id/play', canActivate: [authGuard], data: { seo: { title: 'Play Mafia - Mafia SaaS', description: 'Private Mafia SaaS game session.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent) },
  { path: 'tournament', data: { seo: { title: 'Mafia Tournament Management - Mafia SaaS', description: 'Create, register, and manage Mafia tournaments for clubs and competitive players.' } }, loadComponent: () => import('./features/tournament/tournament.component').then(m => m.TournamentComponent) },
  { path: 'tournament/create', canActivate: [roleGuard(['B2BUser'])], data: { seo: { title: 'Create Tournament - Mafia SaaS', description: 'Private tournament creation workflow for Mafia SaaS club organizers.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./features/tournament/tournament.component').then(m => m.TournamentCreateComponent) },
  { path: 'profile/:id', canActivate: [authGuard], data: { seo: { title: 'Player Profile - Mafia SaaS', description: 'Private Mafia SaaS player profile and statistics.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'leaderboard', canActivate: [authGuard], data: { seo: { title: 'Mafia Leaderboard - Mafia SaaS', description: 'Mafia SaaS player ratings, win rates, and role performance leaderboard.', robots: 'noindex, follow' } }, loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent) },
  { path: 'subscription', data: { seo: { title: 'Mafia SaaS Pricing - Plans for Players and Clubs', description: 'Compare Mafia SaaS pricing plans for individual players, club organizers, and tournament hosts.' } }, loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent) },
  { path: 'admin', canActivate: [roleGuard(['Admin'])], data: { seo: { title: 'Admin - Mafia SaaS', description: 'Private Mafia SaaS admin panel.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', data: { seo: { title: 'Page Not Found - Mafia SaaS', description: 'The requested Mafia SaaS page could not be found.', robots: 'noindex, follow' } }, loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
