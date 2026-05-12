# Analytics Tracking - Mixpanel

This Angular app uses Mixpanel for product analytics through `src/app/core/services/analytics.service.ts`.

## Tech Stack

| Detail | Value |
|---|---|
| Platform | Angular 18 web app |
| Mixpanel SDK | Browser script from `https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js` |
| Tracking method | Client-side |
| CDP | None found in the codebase |
| Consent required | Yes, EU users are in scope |
| Mixpanel API host | `https://api-eu.mixpanel.com` |
| Token location | `AnalyticsService.mixpanelToken` |

## Initialization And Consent

Mixpanel must only initialize after the user accepts analytics tracking in the app consent banner.

- App startup calls `analytics.setUser(...)` and `analytics.init()` in `src/app/app.component.ts`.
- The consent banner is rendered in `src/app/app.component.ts`.
- Consent is stored in local storage under `mafia_analytics_consent`.
- Do not import Mixpanel directly in feature components or services. Use `AnalyticsService`.

## Identity

| Action | Location |
|---|---|
| Identify current user on session restore | `src/app/app.component.ts` |
| Identify user on login | `src/app/core/services/auth.service.ts` |
| Identify and track signup | `src/app/core/services/auth.service.ts` |
| Reset identity on logout | `src/app/core/services/auth.service.ts` |

Use the stable internal user ID as Mixpanel `distinct_id`. Do not use email as the identifier.

## Current Events

| Event | Trigger | Key properties | File |
|---|---|---|---|
| `page_view` | Route navigation after consent | `page_path`, `platform`, `user_role` | `src/app/core/services/analytics.service.ts` |
| `sign_up_completed` | User completes registration | `sign_up_method`, `platform`, `user_role` | `src/app/core/services/auth.service.ts` |
| `user_login` | User logs in | `event_category`, `event_label`, `platform`, `user_role` | `src/app/core/services/auth.service.ts` |
| `game_created` | User creates a game room | `game_id`, `scenario_id`, `scenario_name`, `host_id`, `player_count`, `max_players` | `src/app/core/services/game.service.ts` |
| `game_joined` | User joins a game room | `game_id`, `scenario_id`, `player_count` | `src/app/core/services/game.service.ts` |
| `game_started` | Host starts a game | `game_id`, `scenario_id`, `player_count`, `role_count` | `src/app/core/services/game.service.ts` |
| `game_completed` | Game reaches a completed state | `game_id`, `scenario_id`, `player_count`, `phase_count`, `winning_side`, `stat_event_count` | `src/app/core/services/game.service.ts` |
| `plan_upgraded` | User completes subscription upgrade | `subscription_id`, `plan`, `payment_provider`, `amount`, `currency` | `src/app/core/services/subscription.service.ts` |
| `tournament_created` | Organizer creates a tournament | `tournament_id`, `scenario_id`, `max_participants`, `prize`, `start_date` | `src/app/core/services/tournament.service.ts` |
| `cta_clicked` | Landing page CTA click | `cta_label`, `page_name`, `platform`, `user_role` | `src/app/features/landing/landing.component.ts` |
| `leaderboard_viewed` | Leaderboard component opens | `platform`, `user_role` | `src/app/features/leaderboard/leaderboard.component.ts` |

## Adding Events

1. Use `snake_case` event and property names.
2. Track only after the user action succeeds.
3. Keep event properties flat and typed.
4. Omit empty values instead of sending `null` or empty strings.
5. Add new events to this file after implementation.
6. Verify in Mixpanel Live View after accepting the app consent banner.
