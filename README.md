# HackNation Frontend

Production-grade React frontend for the HackNation AI-powered healthcare intelligence platform.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS 3** (white / black / gold visual language)
- **Axios** for HTTP, **React Query** for fetching/caching
- **Zustand** for global UI state
- **React Router** with lazy-loaded routes

## Monorepo layout

```
frontend/
├── apps/
│   └── web/          # Vite React app (the user-facing client)
├── package.json      # npm workspaces root
└── tailwind.config.js
```

## Getting started

```bash
# from the frontend/ root
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies/calls the Django backend at
`http://localhost:8000` by default. Override the API URL by creating
`apps/web/.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Scripts (root)

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check and produce a production build |
| `npm run preview` | Preview the built app locally        |
| `npm run typecheck` | Run TypeScript in `--noEmit` mode    |

## Backend endpoints consumed

| Method | Path                     | Purpose                                  |
| ------ | ------------------------ | ---------------------------------------- |
| POST   | `/api/search/`           | Filter/keyword facility search           |
| POST   | `/api/agent/query/`      | Natural-language agentic recommendation  |
| POST   | `/api/facility/analyze/` | LLM analysis for a single facility       |

## Pages

- `/` – Dashboard: filtered search + ranked facility list
- `/agent` – AI agent chat: ask questions in natural language
