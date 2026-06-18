# Architecture

> Last updated: 2026-06-18
> Focus: Architecture

## System Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────────┐
│  Browser     │────▶│  Express 5    │────▶│  Django + DRF        │
│  (React SPA) │     │  (port 5000)  │     │  (port 8000)         │
│              │     │              │     │                       │
│  Vite HMR    │     │  Dev: Vite   │     │  accounts (auth)      │
│  (dev only)  │     │  middleware  │     │  users (CRUD)         │
│              │     │  Prod:       │     │  identity (docs/bio)  │
│              │     │  static files│     │                       │
└─────────────┘     └──────────────┘     └───────────────────────┘
                           │                        │
                           │                        │
                     ┌─────▼─────┐          ┌──────▼──────┐
                     │ Drizzle    │          │   SQLite    │
                     │ (PG schema)│          │  (dev DB)   │
                     └───────────┘          └─────────────┘
```

## Key Patterns

### Two-Backend Pattern
- **Express.js** serves as a web server / reverse proxy for the frontend
- **Django + DRF** provides the REST API backend
- In development: Express uses Vite middleware for HMR
- In production: Express serves built static files from `dist/public/`
- API calls to `/api/*` are proxied through Vite dev server to Django

### Authentication Flow (State Machine)
```
[Login Page] → POST /api/login/ → [OTP Page] → POST /api/verify-login-otp/
                                                     │
                                              ┌──────┴──────┐
                                              ▼              ▼
                                         [Admin]         [User]
                                              │              │
                                              ▼              ▼
                                         JWT issued    Biometric verify
                                                         │
                                                         ▼
                                                    JWT issued
                                              ┌──────┴──────┐
                                              ▼              ▼
                                      [Admin Dash]    [User Dash]
```

### Route Protection Pattern
- `App.tsx:17-25` — `ProtectedRoute` component checks `getAuthToken()` and `getUserRole()` from localStorage
- Redirects unauthenticated users to `/login`
- Role-based filtering via `allowedRole` prop
- Root `/` auto-redirects based on role (admin → `/admin-dashboard`, user → `/user-dashboard`)

### Shared Types Pattern
- `shared/schema.ts` — Drizzle ORM table definitions + Zod schemas for validation
- `shared/routes.ts` — API route definitions with typed request/response schemas
- Both frontend and server import from `@shared` alias
- Frontend uses shared routes for form validation (`zodResolver(api.auth.login.input)`)

## Data Flow

### Login Flow
1. **Login Page** → `useLogin()` mutation → `POST http://127.0.0.1:8000/api/login/`
2. Django validates credentials → generates OTP → sends to console email
3. **OTP Page** → `useVerifyOtp()` mutation → `POST http://127.0.0.1:8000/api/verify-login-otp/`
4. Django verifies OTP → admin gets JWT directly, user gets biometric challenge
5. `setAuthSession()` stores tokens in localStorage → redirects based on role

### Dashboard Data Flow
1. `useUserDashboard()` / `useAdminDashboard()` hooks call Django API via `authFetch()`
2. `authFetch()` attaches `Authorization: Bearer <token>` header
3. Django validates JWT, checks permissions, returns login history
4. Data displayed in table with date formatting via `date-fns`

## Entry Points

| Layer | File | Purpose |
|---|---|---|
| Frontend | `client/index.html` | HTML shell |
| React root | `client/src/main.tsx` | `createRoot(document.getElementById("root"))` |
| App shell | `client/src/App.tsx` | Router + providers (QueryClient, Tooltip, Toaster) |
| Express server | `server/index.ts` | HTTP server initialization |
| Express routes | `server/routes.ts` | API route registration (currently empty placeholder) |
| Django server | `backend/manage.py` | Django management entry |
| Django root | `backend/backend/urls.py` | URL configuration |
| Build script | `script/build.ts` | Production build (Vite client + esbuild server) |

## Abstractions

| Layer | Abstraction | Implementation |
|---|---|---|
| Storage | `IStorage` interface | `MemStorage` class (in-memory Map) |
| Auth hooks | `useAuth` mutations | Direct `fetch()` calls to Django API |
| API client | `apiRequest()` | Wrapper around `fetch()` with error handling |
| Query client | `QueryClient` | TanStack React Query with `getQueryFn` |
| UI components | `Input`, `Button`, `Card`, `Badge` | Custom components in `ui-elements.tsx` |
| Django models | `User`, `LoginHistory` | `accounts/models.py` |
| Django REST | `APIView` subclasses | Views in `accounts/views.py`, `identity/views.py` |
