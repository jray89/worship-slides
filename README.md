# Worship Slides

A worship service slide management app for creating, previewing, and exporting presentation slides (psalms, scripture readings, key verses, welcome/closing slides). Built with a Rails API backend and React frontend.

## Tech Stack

- **Backend:** Ruby on Rails 8 (API mode), Ruby 3.3.6, SQLite, Puma
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **PDF/PNG Export:** Grover (Puppeteer)
- **Deploy:** Docker (single container)

## Prerequisites

- Ruby 3.3.6 (via rbenv or asdf)
- Node.js 22+ (via nvm)
- pnpm 9
- Bundler

## Development Setup

```bash
# Frontend
cd frontend
nvm use 22
pnpm install
pnpm dev          # Starts dev server on port 5174

# Backend
cd backend
bundle install
bin/rails db:setup
bin/rails s       # Starts API server on port 3000
```

The Vite dev server proxies `/api` requests to the Rails server on port 3000.

### PDF/PNG Export (local)

Export requires built frontend assets accessible to the Rails server:

```bash
cd frontend && nvm use 22 && pnpm run build
ln -sf $(pwd)/frontend/dist/assets backend/public/assets
ln -sf $(pwd)/frontend/dist/index.html backend/public/index.html
```

Rebuild and re-symlink after frontend changes if you need to test exports locally.

## Project Structure

```
├── backend/          # Rails API
│   ├── app/
│   │   ├── controllers/api/   # REST endpoints
│   │   └── services/          # SlideRenderer (pagination/layout)
│   └── public/                # Static assets (symlinked in dev)
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/        # Slide components, print views
│   │   ├── pages/             # Service list, edit, preview
│   │   └── hooks/             # Auth, API
│   └── dist/                  # Production build output
└── Dockerfile        # Multi-stage build
```

## Deployment

The Dockerfile handles everything in a multi-stage build:
1. Installs Ruby/Node dependencies
2. Builds the frontend (`pnpm run build`)
3. Copies `frontend/dist/*` into `backend/public/`
4. Runs the Rails server (serves both API and static frontend)
