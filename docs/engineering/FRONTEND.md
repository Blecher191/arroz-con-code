# Frontend Architecture

## Overview

The frontend is a single-page application (SPA) built with React, React Router, and Tailwind CSS. It lives in the `frontend/` folder at the root of the repo.

All routing happens client-side. The server only serves one HTML file — React takes over from there and handles which page to show based on the URL.

---

## Folder Structure

```
frontend/
├── index.html              # App entry point — loads the React app
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Build tool configuration
├── tsconfig.json           # TypeScript project references
├── tsconfig.app.json       # TypeScript config for src/ code
├── tsconfig.node.json      # TypeScript config for build tooling
├── .env.example            # Environment variable template
└── src/
    ├── main.tsx            # Mounts the app into the DOM
    ├── index.css           # Global styles (Tailwind import)
    ├── router.tsx          # All routes defined in one place
    ├── context/            # Global state shared across the app
    ├── layouts/            # Page wrappers (navbar + content area)
    ├── components/         # Reusable UI pieces
    └── pages/              # One file per screen/route
```

---

## How the App Starts

When the browser loads the app, this is the order of execution:

```
index.html
  └── src/main.tsx
        ├── Wraps everything in <AuthProvider>   (makes auth state available app-wide)
        └── Renders <RouterProvider>             (hands control to the router)
              └── router.tsx                     (decides which page to show)
                    └── RootLayout               (renders Navbar + current page)
```

Every page lives inside `RootLayout`, which means the navbar is always present.

---

## Routing (`src/router.tsx`)

All routes are defined in a single file using React Router's `createBrowserRouter`.

| Route | Page Component | Auth Required |
|-------|---------------|---------------|
| `/` | `LandingPage` | No |
| `/signup` | `SignUpPage` | No |
| `/signin` | `SignInPage` | No |
| `/chat` | `ChatPage` | No |
| `/community` | `CommunityBoardPage` | No |
| `/community/new` | `CreatePostPage` | Yes |
| `/community/:id` | `PostDetailPage` | No (read) / Yes (comment) |
| `/settings` | `SettingsPage` | Yes |

Routes that require login are wrapped in `<ProtectedRoute>` directly in `router.tsx`:

```tsx
{
  path: "/community/new",
  element: (
    <ProtectedRoute>
      <CreatePostPage />
    </ProtectedRoute>
  ),
}
```

> Note: `/community/new` is defined before `/community/:id` so the static segment "new"
> is never mistakenly captured as a post ID.

---

## Layouts (`src/layouts/`)

### `RootLayout.tsx`
The single layout that wraps every page. It renders the `Navbar` at the top and an `<Outlet />` below it. The `<Outlet />` is where React Router injects the current page component.

```
┌─────────────────────────────┐
│         Navbar              │
├─────────────────────────────┤
│                             │
│    <Outlet /> (active page) │
│                             │
└─────────────────────────────┘
```

---

## Components (`src/components/`)

### `Navbar.tsx`
The sticky top navigation bar. It reads from `AuthContext` to show different links depending on whether the user is logged in.

- **Logged out:** shows Sign In and Sign Up links
- **Logged in:** shows Settings and Sign Out button

### `ProtectedRoute.tsx`
A wrapper component that checks if the user is authenticated before rendering a page. If they are not logged in, it redirects them to `/signin` and remembers where they were trying to go, so they can be returned there after signing in.

```tsx
// Usage in router.tsx
<ProtectedRoute>
  <SettingsPage />
</ProtectedRoute>
```

---

## Context (`src/context/`)

### `AuthContext.tsx`
Provides authentication state to the entire app. Any component can call `useAuth()` to read or update auth state.

**What it exposes:**

| Name | Type | Description |
|------|------|-------------|
| `isAuthenticated` | `boolean` | Whether the user is currently logged in |
| `login(token)` | `function` | Call this after a successful sign-in to store the token and update state |
| `logout()` | `function` | Clears the token and marks the user as logged out |

Auth state is persisted in `localStorage` so the user stays logged in across page refreshes.

**How to use it in any component:**

```tsx
import { useAuth } from "../context/AuthContext";

const { isAuthenticated, login, logout } = useAuth();
```

---

## Pages (`src/pages/`)

Each file maps 1:1 to a route. Pages are responsible for their own layout content — they render inside `RootLayout`'s `<Outlet />`.

| File | Route | What it does |
|------|-------|-------------|
| `LandingPage.tsx` | `/` | Hero section with two CTAs linking to Chat and Community |
| `SignUpPage.tsx` | `/signup` | Email + password registration form |
| `SignInPage.tsx` | `/signin` | Email + password login form; reads redirect state from `ProtectedRoute` |
| `ChatPage.tsx` | `/chat` | Message thread UI, input box, send button — open to all users |
| `CommunityBoardPage.tsx` | `/community` | Post list with category filter tabs and "New Post" button |
| `PostDetailPage.tsx` | `/community/:id` | Full post with comments; comment input is disabled until logged in |
| `CreatePostPage.tsx` | `/community/new` | Form to write and publish a new post (protected) |
| `SettingsPage.tsx` | `/settings` | Display name, email, password, and language preference (protected) |

---

## Styling

Tailwind CSS v4 is used for all styling. There is no `tailwind.config.js` — v4 is configured directly in the CSS file:

```css
/* src/index.css */
@import "tailwindcss";
```

The Vite plugin (`@tailwindcss/vite`) scans all source files automatically and generates only the styles that are used. Tailwind utility classes are applied directly on elements in each component.

---

## Environment Variables

Copy `.env.example` to `.env` before running locally:

```
VITE_API_URL=http://localhost:5000
```

All environment variables exposed to the browser must be prefixed with `VITE_`. Access them in code with `import.meta.env.VITE_API_URL`.

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` by default.
