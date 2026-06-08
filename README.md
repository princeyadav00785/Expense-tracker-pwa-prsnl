# Expense Tracker PWA

A minimal, offline-first expense tracker built as a Progressive Web App. Designed for iOS where free, no-nonsense expense trackers are hard to find.

No servers, no databases, no subscriptions — just your browser's localStorage.

## Features

- **Add expenses** with amount, description, category, and date
- **9 categories** — Food, Transport, Shopping, Bills, Health, Fun, Education, Travel, Other
- **Monthly navigation** — browse spending history month by month
- **Charts** — donut chart (category split), daily spending bars, category bar chart
- **Export/Import JSON** — download your data anytime, restore from backup
- **PWA** — install on home screen, works fully offline
- **Dark UI** — clean, animated, mobile-first interface

## Usage

1. Visit the deployed URL
2. On iOS: Safari → Share → Add to Home Screen
3. Start logging expenses

## Data

All data lives in `localStorage` under the key `expense_tracker_data`. Use the export button (↓) to save a JSON backup anytime.

## Deploy

Static files in `public/` — deploy anywhere:

```bash
# Vercel
vercel --prod

# Netlify
# Just drag the public/ folder to netlify drop, or connect the repo
```

## Tech

- Vanilla JS — no frameworks, no build step
- CSS animations and transitions
- Service Worker for offline caching
- PWA manifest for home screen install

## License

MIT

---

made with ♥ by prnc
