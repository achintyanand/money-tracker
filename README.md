# Aura Finance – Money Tracker

A client-side income/expense tracker. No build step, no backend: data lives in `localStorage`.

## Structure

```
index.html            Markup only
css/styles.css        Design tokens, glass effects, tabs/chips/toggles, animations
js/
  tailwind-config.js  Tailwind CDN theme
  constants.js        Storage keys, defaults, demo data
  utils.js            Helpers (escapeHtml, dates, CSV, number formatting)
  store.js            State, persistence, filtering and totals (no DOM)
  charts.js           Chart.js doughnut charts
  views.js            Rendering + HTML templates
  modals.js           Alert/confirm dialog, transaction form, category manager
  app.js              Event wiring (data-action delegation) and startup
```

Scripts are loaded in that order from `index.html`; each file depends only on the ones above it.

## Run locally

Open `index.html` in a browser (or serve the folder with any static server).
