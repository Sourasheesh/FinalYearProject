# External Integrations

> Last updated: 2026-06-18
> Focus: Tech

## API Endpoints

### Django REST API (port 8000)

**Accounts (Auth)**
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/signup/` | User registration (used in `use-auth.ts:useSignup`) |
| POST | `/api/login/` | Step 1 login — validates credentials, sends OTP |
| POST | `/api/verify-otp/` | Step 2a — email OTP verification for signup |
| POST | `/api/verify-login-otp/` | Step 2b — login OTP verification, issues JWT |

**Dashboards**
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/user/dashboard/` | User's login history (protected, role=user) |
| GET | `/api/admin/dashboard/` | All login history (protected, role=admin) |
| GET | `/api/login-history/` | All login history (admin, used by Django directly) |

**Identity Management**
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/identity/create/` | Create identity record |
| POST | `/api/identity/update/` | Update identity |
| POST | `/api/identity/delete/` | Delete identity |
| GET | `/api/identity/list/` | List all identities (admin) |
| GET | `/api/identity/unified-card/` | Get unified identity card |
| GET | `/api/identity/verify/<uin>/` | Verify identity by UIN |
| GET | `/api/identity/user/<uin>/` | Get user identities by UIN |
| GET | `/api/identity/mismatch/<uin>/` | Get mismatches by UIN |
| PATCH | `/api/identity/resolve-mismatch/` | Resolve identity mismatch |
| POST | `/api/identity/upload-biometric/` | Upload biometric data |
| POST | `/api/identity/verify-biometric/` | Verify biometric (fingerprint/iris) |

**User Management**
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/users/create-user/` | Admin creates user |
| GET | `/api/users/list/` | List all users (admin) |
| PUT | `/api/users/update/<id>/` | Update user (admin) |
| DELETE | `/api/users/delete/<id>/` | Delete user (admin) |

**Admin**
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/admin/signup` | Admin signup |
| GET | `/admin/` | Django admin panel |

### Vite Proxy
Development setup in `vite.config.ts:42-46` proxies `/api` requests to `http://localhost:8000`.

**However**, the frontend hooks in `client/src/hooks/use-auth.ts:5` hardcode `API_BASE = "http://127.0.0.1:8000/api"`, bypassing the proxy entirely. The dashboard hooks in `use-dashboards.ts` use `authFetch` which calls the Django API via relative paths (through the Vite proxy).

## Databases

| Database | Engine | Purpose |
|---|---|---|
| SQLite | `backend/db.sqlite3` | Django dev database (users, identities, biometrics, login history) |
| PostgreSQL | Via `DATABASE_URL` env var | Drizzle ORM schema (configured but not actively used by frontend) |

## Authentication

### Auth Flow
1. User registers (`/api/signup/`) → account created (email unverified)
2. Email verification (console email in dev)
3. Login: credentials → OTP sent to email → OTP verification → JWT issued
4. JWT stored in `localStorage` (`accessToken`, `refreshToken`, `userRole`)
5. Protected routes check JWT via `getAuthToken()`
6. Non-admin users have biometric verification step after OTP

### JWT Configuration
| Setting | Value |
|---|---|
| Access token lifetime | 30 minutes |
| Refresh token lifetime | 1 day |
| Algorithm | HS256 |
| Auth header | `Authorization: Bearer <token>` |

### Credential Storage
- `localStorage`: `accessToken`, `refreshToken`, `userRole`
- `sessionStorage`: `otpEmail` (temporary during 2FA flow)

## Email
- **Backend**: Console email backend (`django.core.mail.backends.console.EmailBackend`)
- **OTP emails**: Printed to console in development via `accounts/services.py:send_otp_email`

## External Services & Libraries
| Service | Library | Endpoint | Purpose |
|---|---|---|---|
| Google Fonts | — | `https://fonts.googleapis.com/...` | Inter + Outfit font families |
| Unsplash | — | `https://images.unsplash.com/...` | Decorative background images on login/signup pages |

## Security Notes
- JWT tokens vulnerable to XSS (stored in `localStorage` — not httpOnly cookies)
- Hardcoded fallback SECRET_KEY in Django `settings.py:7`
- `CORS_ALLOW_ALL_ORIGINS = True` in production settings
- `DEBUG = True` in Django settings
- Frontend API base URL hardcoded to `http://127.0.0.1:8000`
