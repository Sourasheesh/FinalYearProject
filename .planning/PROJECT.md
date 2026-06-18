# SecureApp

## What This Is

A secure identity management platform with JWT-based authentication, OTP two-factor verification, biometric verification, and multi-document identity management. Users authenticate via email/password + OTP, and non-admin users complete biometric verification to receive JWT tokens. The platform supports role-based access (user/admin) with separate dashboards for each role.

## Core Value

User can securely authenticate, manage their identity documents, and verify their identity through a clean, modern interface.

## Requirements

### Validated

- ✓ User can sign up with email/password and role selection — existing
- ✓ User can log in with email/password — existing
- ✓ User receives OTP and completes 2FA verification — existing
- ✓ Admin receives JWT directly after OTP; users redirected to biometric verification — existing
- ✓ JWT tokens stored in localStorage with authFetch wrapper — existing
- ✓ Protected routes redirect unauthenticated users to login — existing
- ✓ Role-based routing (admin → admin-dashboard, user → user-dashboard) — existing
- ✓ User dashboard displays login history with status badges — existing
- ✓ Admin dashboard displays global audit log with search/filter — existing
- ✓ Shared Zod schemas for API request/response validation — existing
- ✓ Custom UI component library (Input, Button, Card, Badge) — existing
- ✓ shadcn/ui component library (30+ components) installed — existing

### Active

- [ ] **IDENT-01**: User can view all their identity documents (Aadhaar, PAN, Passport, Voter ID, Driving License) with verification status
- [ ] **IDENT-02**: Admin can create identity records for users with all document types
- [ ] **IDENT-03**: Admin can update existing identity records
- [ ] **IDENT-04**: Admin can delete identity records
- [ ] **IDENT-05**: Admin can view all identities with search/filter
- [ ] **IDENT-06**: User can view their unified identity card showing all linked identities
- [ ] **BIO-01**: User can upload fingerprint template for biometric registration
- [ ] **BIO-02**: User can verify identity via fingerprint during login flow
- [ ] **BIO-03**: User can upload iris template for biometric registration
- [ ] **BIO-04**: User can verify identity via iris during login flow
- [ ] **ADMIN-01**: Admin can view paginated list of all users
- [ ] **ADMIN-02**: Admin can create new user accounts
- [ ] **ADMIN-03**: Admin can update user details
- [ ] **ADMIN-04**: Admin can delete user accounts

### Out of Scope

- Password reset flow — backend endpoint exists but frontend not scoped
- Mobile app — web-first, mobile later
- OAuth/Social login — not in current scope
- Real-time notifications — not in current scope
- Email verification page — console email in dev, deferred

## Context

Project uses a two-backend architecture: Express.js (port 5000) serves the React SPA and proxies API calls to Django REST Framework (port 8000). The Django backend uses SQLite, JWT auth via simplejwt, and console email for OTP delivery. The frontend uses React 18 + Vite + Tailwind CSS + shadcn/ui with wouter for routing and TanStack React Query for server state.

Key API prefixes:
- `/api/` — Auth endpoints (accounts app)
- `/api/users/` — User management (users app)
- `/api/identity/` — Identity + biometric (identity app)

## Constraints

- **Design**: New pages must match existing clean/minimal aesthetic (ShieldCheck branding, glass panels, Inter + Outfit fonts, same color scheme)
- **Pattern**: Use existing patterns (wouter routes, react-hook-form + zod, react-query hooks, authFetch for API calls)
- **Backend**: Frontend calls Django API directly at `http://127.0.0.1:8000` for auth hooks, uses relative paths through Vite proxy for dashboards

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Identity management first | User's priority — most missing functionality | — Pending |
| Full CRUD for identities | Admin needs full control over identity records | — Pending |
| All 5 identity types | Backend supports all types, UI should match | — Pending |
| Match existing design | Consistent user experience | — Pending |

---

*Last updated: 2026-06-18 after initialization*
