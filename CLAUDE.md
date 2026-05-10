# Worship Slides

Church worship service slide management app — Rails API backend + React/Vite frontend.

## Architecture

- **Backend:** Rails API (`backend/`) — Ruby 3.3.6, Puma (3 threads default), SQLite
- **Frontend:** React + Vite + Tailwind (`frontend/`) — TypeScript, port 5174
- **PDF/PNG export:** Grover gem (Puppeteer wrapper) renders React components to PDF/PNG
- **Deploy:** Single Dockerfile builds both, copies `frontend/dist/*` into `backend/public/`

## Development Setup

Requires Node 22+ for frontend builds (TypeScript 6 needs it):
```bash
nvm use 22
cd frontend && pnpm install && pnpm run build
```

For PDF export to work locally, symlink built assets into backend/public:
```bash
ln -sf $(pwd)/frontend/dist/assets backend/public/assets
ln -sf $(pwd)/frontend/dist/index.html backend/public/index.html
```

Rails server: `cd backend && bin/rails s` (port 3000)
Frontend dev: `cd frontend && pnpm dev` (port 5174, proxies /api to :3000)

## Key Patterns

- PDF/PNG export uses Grover with inline HTML (not URL fetch) to avoid Puma thread deadlock. Data is embedded as `window.__PRINT_DATA__` so React renders without calling back to the API.
- Print views (`PrintSlidesView`, `PrintTitleCardView`) check for `window.__PRINT_DATA__` first, then fall back to API fetch for normal browser usage.
- `frontend_assets` helper extracts script/link tags from the built `index.html` to include in Grover's HTML string.

## Testing PDF Export

The export needs: built frontend assets available at `backend/public/assets/`, and `backend/public/index.html` (or `frontend/dist/index.html`) present. After frontend changes, rebuild and re-symlink.
