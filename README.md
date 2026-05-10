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
- Vercel deployment with SPA route fallback
- GitHub Pages-compatible static build

## Important URLs

Current GitHub Pages site:

```text
https://alnmrtnk.github.io/mafia-saas-angular/
```

After deploying to Vercel, the production URL will look similar to:

```text
https://mafia-saas-angular.vercel.app/
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

For Vercel, the deployed static output directory is:

```text
dist/mafia-saas-angular/browser
```

## Tests

Run unit tests:

```bash
npm test
```

## Vercel Deployment

This project includes a `vercel.json` file with a fallback rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

The rewrite is required for Angular single-page application routes. It allows direct access to URLs such as:

```text
/subscription
/tournament
/dashboard
```

Recommended Vercel settings:

```text
Framework Preset: Angular
Build Command: npm run build
Output Directory: dist/mafia-saas-angular/browser
Install Command: npm install
```

Deployment steps:

1. Push the repository to GitHub.
2. Open Vercel and choose Add New Project.
3. Import this GitHub repository.
4. Confirm the Angular build settings.
5. Deploy the project.
6. Use the generated `.vercel.app` URL in Google Search Console and analytics services.

## GitHub Pages Routing Note

GitHub Pages does not provide server-side rewrite rules for deep SPA routes. Because of that, direct URLs such as:

```text
https://alnmrtnk.github.io/mafia-saas-angular/subscription
https://alnmrtnk.github.io/mafia-saas-angular/tournament
```

can return a GitHub Pages 404 because there are no physical folders with those names. For full SEO-friendly clean URLs, use the Vercel deployment.

For Google Search Console checks on GitHub Pages, the safest canonical URL is:

```text
https://alnmrtnk.github.io/mafia-saas-angular/
```

## Subject Area

The subject area of the project is online gaming and SaaS tools for Mafia clubs. The platform is intended for players, moderators, tournament organizers, and clubs that need digital tools for hosting games, managing tournaments, tracking results, and analyzing player performance.

## Author

Created as an Angular study project for the Mafia SaaS web application.
