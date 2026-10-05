# Worship Slides

[![CI](https://github.com/jray89/worship-slides/actions/workflows/ci.yml/badge.svg)](https://github.com/jray89/worship-slides/actions/workflows/ci.yml)

A worship service slide management app for creating, previewing, and exporting presentation slides (psalms, scripture readings, key verses, welcome/closing slides). Built with a Rails API backend and React frontend.

## Why

<!-- TODO(Jason): rewrite in your own words: who used to make the slides, how long it took, what changed. -->
Building slides for a service by hand means looking up each metrical psalm, splitting its stanzas so they fit on a screen, pasting in the scripture readings and making a sermon title card. Worship Slides does that from the order of worship: enter the psalm numbers and scripture references, preview the deck, and export a print-ready PDF plus a transparent title card PNG.

## Features

- **Psalms by number and verse range**: all 150 psalms of the 1650 Scottish Metrical Psalter, including second versions, split into screen-sized stanzas with verse numbers.
- **Scripture by reference**: type `John 3:16-18` or `Romans 16`; KJV text is fetched and paginated to fit the slide.
- **Fixed slides**: welcome, private prayer, closing and blank.
- **Reordering**: drag and drop on desktop, up/down arrows on touch screens.
- **Live preview**: a scaled 1920×1080 carousel of the rendered deck.
- **Export**: a multi-page 1920×1080 PDF and a transparent sermon title card PNG, rendered by headless Chrome.
- **Login**: JWT authentication for the people who build the slides.

## Screenshots

<!-- TODO: add screenshots of the editor, the preview carousel and an exported slide -->

| Editor | Preview | Exported slide |
|---|---|---|
| _coming soon_ | _coming soon_ | _coming soon_ |

## Tech Stack

- **Backend:** Ruby on Rails 8 (API mode), Ruby 3.3.6, SQLite (dev/test), PostgreSQL (production), Puma
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

Create a login from the Rails console (`bin/rails c`):

```ruby
User.add(first_name: "Jay", last_name: "Example", email: "jay@example.com", password: "change-me")
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

## Tests and checks

```bash
# Backend
cd backend
bin/rails test     # model, service and request tests
bin/rubocop
bin/brakeman

# Frontend
cd frontend
pnpm lint
pnpm test          # Vitest
pnpm build         # includes tsc
```

GitHub Actions runs all of these on every pull request ([.github/workflows/ci.yml](.github/workflows/ci.yml)). Request tests stub Grover, so they don't need Chrome.

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

## Sources

- **Psalms**: the 1650 Scottish Metrical Psalter, which is in the public domain. Text is stored in `backend/data/psalms/`; it was collected with `backend/bin/scrape_psalms`.
- **Scripture**: the King James Version, which is in the public domain in the US. It is fetched at runtime from the [Free Use Bible API](https://bible.helloao.org).

## License

The code is released under the [MIT License](LICENSE). Church names, logos and addresses in the slide templates belong to their respective congregations and are not covered by the license.

