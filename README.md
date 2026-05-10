# Mafia SaaS Angular

Mafia SaaS Angular is a single-page web application for online Mafia games, player statistics, club tournaments, subscriptions, and game-room management. The project was built with Angular 18 as a study/demo SaaS product for the social deduction games domain.

## Live Demo

[Open Mafia SaaS Angular](https://alnmrtnk.github.io/mafia-saas-angular/)

## Project Purpose

The application demonstrates how an online Mafia platform can support both individual players and club organizers. It includes public pages for product presentation and pricing, protected user areas, tournament workflows, mock data storage, charts, SEO metadata, and basic analytics integration.

## Main Features

- Landing page for the Mafia SaaS product
- Authentication pages for login and registration
- Player dashboard with statistics and recent activity
- Game room and lobby interface
- Tournament listing and creation flow
- Player leaderboard
- Subscription and pricing plans for B2C and B2B users
- Admin panel access for privileged users
- Multilingual UI support
- Theme switching
- SEO metadata, sitemap, robots.txt, and Google Search Console readiness
- Google Analytics event and page-view tracking

## Tech Stack

- Angular 18
- TypeScript
- SCSS
- Angular Router
- Angular standalone components
- ng2-charts and Chart.js
- lucide-angular icons
- LocalStorage-based mock persistence
- GitHub Pages deployment

## Important URLs

Main site:

```text
https://alnmrtnk.github.io/mafia-saas-angular/
```

Sitemap:

```text
https://alnmrtnk.github.io/mafia-saas-angular/sitemap.xml
```

Robots file:

```text
https://alnmrtnk.github.io/mafia-saas-angular/robots.txt
```

## SEO and Web Analytics Context

This project can be used for manual website analysis in services such as:

- Google Analytics 4
- Google Search Console
- Serpstat
- Ahrefs Webmaster Tools
- Microsoft Clarity
- Bing Webmaster Tools
- Semrush
- Similarweb

Recommended conversion goals for analytics:

- User registration
- Login
- Visit to subscription page
- Pricing plan selection
- Tournament page visit
- Game room visit
- Dashboard visit

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open:

```text
http://localhost:4200/
```

## Build

Create a production build:

```bash
npm run build
```

The build output is generated in:

```text
dist/mafia-saas-angular/
```

## Tests

Run unit tests:

```bash
npm test
```

## GitHub Pages Routing Note

This project is an Angular single-page application. GitHub Pages does not provide server-side rewrite rules for deep SPA routes. Because of that, URLs such as:

```text
https://alnmrtnk.github.io/mafia-saas-angular/subscription
https://alnmrtnk.github.io/mafia-saas-angular/tournament
```

may return a 404 page when opened directly in the browser, even though they work correctly when navigating inside the application.

For SEO and Google Search Console checks, the safest canonical entry point on GitHub Pages is:

```text
https://alnmrtnk.github.io/mafia-saas-angular/
```

If full direct access to every route is required, deploy the project to a hosting provider with SPA fallback rewrites, such as Netlify, Vercel, Firebase Hosting, or another static host that can serve `index.html` for all application routes.

## Subject Area

The subject area of the project is online gaming and SaaS tools for Mafia clubs. The platform is intended for players, moderators, tournament organizers, and clubs that need digital tools for hosting games, managing tournaments, tracking results, and analyzing player performance.

## Author

Created as an Angular study project for the Mafia SaaS web application.
