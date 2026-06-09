# CampaignIQ

A React application for visualizing and analyzing marketing campaign performance.

Built with React, TypeScript, and Vite.

## Features

- Ingest campaign metadata from a local JSON file
- Display key metrics: impressions, clicks, conversions, and CTR
- Filter and compare campaigns side by side
- Fully client-side — drop in your data and go

## Tech stack

- React 18
- TypeScript
- Vite

## Getting started

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/Sintonice/CampaingIQ.git
cd CampaingIQ

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Data format

Campaign data is loaded from `metadata.json` at the project root. Each entry follows this shape:

```json
[
  {
    "id": "campaign-1",
    "name": "Summer Sale",
    "impressions": 50000,
    "clicks": 1200,
    "conversions": 340,
    "budget": 2000
  }
]
```

Edit `metadata.json` to load your own campaigns — no backend needed.

## Available scripts

| Command           | Description                            |
|-------------------|----------------------------------------|
| `npm run dev`     | Start local development server         |
| `npm run build`   | Build for production (outputs `dist/`) |
| `npm run preview` | Preview the production build locally   |
| `npm run lint`    | Run ESLint                             |
