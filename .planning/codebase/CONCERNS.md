# Concerns & Technical Debt

> Last updated: 2026-06-18
> Focus: Concerns

## Security Concerns

### 🔴 Critical

1. **Hardcoded Django SECRET_KEY** — `backend/backend/settings.py:7` contains a fallback Django secret key. If deployed without `SECRET_KEY` env var, this key is used for signing JWTs and session data.

2. **localStorage JWT Storage** — `client/src/lib/auth.ts` stores access tokens, refresh tokens, and user role in `localStorage`. This is vulnerable to XSS attacks. Prefer httpOnly cookies for production.

3. **CORS Overly Permissive** — `backend/backend/settings.py:130` sets `CORS_ALLOW_ALL_ORIGINS = True`. This should be restricted to specific origins in production.

4. **Django DEBUG=True** — `backend/backend/settings.py:9` leaves debug mode enabled. This exposes stack traces and sensitive config in production.

5. **Hardcoded API URL** — `client/src/hooks/use-auth.ts:5` hardcodes `API_BASE = "http://127.0.0.1:8000/api"`. This won't work in production or non-local environments without changes.

### 🟡 Medium

6. **Console Email Backend** — `backend/backend/settings.py:133` uses console email. OTP codes are printed to stdout. A real SMTP/email service is needed for production.

7. **Biometric Verification Bypass** — The `VerifyBiometric` view at `backend/identity/views.py:302` uses `AllowAny` permission. This allows unauthenticated biometric verification attempts.

8. **Weak OTP Generation** — `backend/accounts/services.py:7` uses `random.randint()` instead of `secrets` module for OTP generation. Use `secrets.randbelow()` for cryptographically secure OTPs.

## Architecture Concerns

### 🟡 Medium

9. **Two Backend Complexity** — The project uses Express.js to serve the frontend and Django for the API, but the frontend hooks call Django directly (bypassing the Express proxy). The Express server routes file (`server/routes.ts`) is a placeholder with no actual routes.

10. **Dual Database Schema** — Drizzle ORM (`shared/schema.ts`) defines PostgreSQL schemas (`users`, `login_history`), but the actual Django backend uses SQLite with its own models. The Drizzle schema appears to be unused in runtime — keeping it in sync with Django models will be maintenance overhead.

11. **Express Server Route Drift** — The API routes defined in `shared/routes.ts` reference paths like `/api/signup/`, `/api/login/`, etc., but these match Django's URLs, not Express. The Express server's `/api` proxy handles this in dev, but there's no production routing layer documented.

12. **Django vs Frontend Route Mismatch** — The frontend shared routes (`shared/routes.ts`) define endpoints differently than what Django serves:
    - Frontend calls `POST /api/verify-otp/` but Django has `POST /api/verify-login-otp/` for login OTP
    - Frontend calls `GET /api/user/dashboard/` and `GET /api/admin/dashboard/` but Django has `GET /api/login-history/` for admin

13. **Build dependencies drift** — `script/build.ts:7-33` lists server dependencies to bundle (including `@google/generative-ai`, `openai`, `stripe`, etc.) that are NOT in `package.json`. These will cause build failures when resolved.

## Code Quality Concerns

### 🟡 Medium

14. **No Test Coverage** — Zero tests across the entire project (see `TESTING.md`).

15. **Unused Dependencies** — `package.json` includes `passport`, `passport-local`, `express-session`, `connect-pg-simple`, `memorystore` which appear unused since auth is handled by Django JWT.

16. **Inconsistent API Base URLs** — `use-auth.ts` calls Django at `http://127.0.0.1:8000/api` directly, while `use-dashboards.ts` calls via relative path (through Vite proxy). This inconsistency could cause CORS or routing issues.

17. **MemStorage** — `server/storage.ts` uses in-memory Map-based storage (`MemStorage`) but it's not connected to any routes. It's a dead code path.

18. **Admin signup is auth bypass** — The `AdminSignupView` creates an admin with just email + username + password — no validation beyond serializer fields.

19. **Biometric utils import but unverified** — `backend/identity/views.py` imports `extract_fingerprint_template`, `extract_iris_template`, `match_fingerprint_templates`, `match_iris_templates` from `biometric_utils.py`. These require specific system libraries that may not be available.

### 🟢 Low

20. **Unused React Query features** — `queryClient.ts` sets `staleTime: Infinity` and `refetchOnWindowFocus: false` which disables automatic refetching.

21. **Missing input-otp usage** — `input-otp` package is in `package.json` dependencies but the OTP page uses a regular text input.

22. **Dead seed file reference** — `backend/seed.py` uses `LoginHistory` with incorrect field name `success=True` — the model field is `login_success`.

23. **LoginHistory field mismatch** — `backend/accounts/seed.py:27` passes `success=True` but `LoginHistory` model field is `login_success`. This will raise a `TypeError`.

## Pending Frontend Work

The user indicated they plan to build a complete frontend. The current frontend has:
- Auth pages (login, signup, OTP) — functional but basic
- Dashboard pages (user, admin) — functional with login history tables
- No user profile/identity management pages
- No biometric verification UI (login flow expects it for non-admin users)
- No notification preferences or settings pages
- Error/loading/empty states exist but are minimal
