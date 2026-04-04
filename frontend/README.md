# Frontend

React + React Router + Tailwind CSS v4

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:5173`

## Environment Variables

```
VITE_API_URL=http://localhost:5000
```

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server         |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build locally |

## Structure

```
src/
├── main.tsx          # App entry point
├── router.tsx        # All routes
├── index.css         # Tailwind import
├── context/          # Auth state
├── layouts/          # RootLayout (navbar + page wrapper)
├── components/       # Navbar, ProtectedRoute
└── pages/            # One file per route
```

For full architecture details see `docs/engineering/FRONTEND.md`.
