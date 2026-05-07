import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'game', canActivate: [authGuard], loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent) },
  { path: 'game/:id/lobby', canActivate: [authGuard], loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent) },
  { path: 'game/:id/play', canActivate: [authGuard], loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent) },
  { path: 'tournament', loadComponent: () => import('./features/tournament/tournament.component').then(m => m.TournamentComponent) },
  { path: 'tournament/create', canActivate: [roleGuard(['B2BUser'])], loadComponent: () => import('./features/tournament/tournament.component').then(m => m.TournamentCreateComponent) },
  { path: 'profile/:id', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'leaderboard', canActivate: [authGuard], loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent) },
  { path: 'subscription', loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent) },
  { path: 'admin', canActivate: [roleGuard(['Admin'])], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
