# CampaignIQ

A client-side dashboard for analyzing digital advertising campaign performance — built to surface what's working, what's wasting budget, and where to act.

Built with React, TypeScript, and Vite.

## What it does

- Ingests campaign data from a local JSON file (no backend required)
- Calculates key performance metrics per campaign: CTR, CPC, conversion rate, and ROAS
- Flags underperforming campaigns — high spend, low conversions
- Enables side-by-side comparison across campaigns, placements, and segments
- Designed for fast iteration: drop in new data and the dashboard updates instantly

## Metrics tracked

| Metric             | Description                                 |
|--------------------|---------------------------------------------|
| CTR                | Click-through rate (clicks / impressions)   |
| CPC                | Cost per click (spend / clicks)             |
| Conversion rate    | Conversions / clicks                        |
| ROAS               | Return on ad spend (revenue / spend)        |
| Budget efficiency  | Flags campaigns burning budget without ROI  |

## Tech stack

- React 18
- TypeScript
- Vite

## Getting started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/Sintonice/CampaingIQ.git
cd CampaingIQ
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Data format

Campaign data is loaded from `metadata.json` at the project root:

```json
[
  {
    "id": "campaign-1",
    "name": "Summer Sale — Meta Ads",
    "impressions": 50000,
    "clicks": 1200,
    "conversions": 340,
    "spend": 2000,
    "revenue": 8500
  }
]
```

Edit `metadata.json` to load your own campaigns. Supports any platform — Meta Ads, Google Display, Taboola, Outbrain.

## Available scripts

| Command             | Description                            |
|---------------------|----------------------------------------|
| `npm run dev`       | Start local development server         |
| `npm run build`     | Build for production (outputs `dist/`) |
| `npm run preview`   | Preview the production build locally   |
