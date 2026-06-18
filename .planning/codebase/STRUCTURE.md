# Directory Structure

> Last updated: 2026-06-18
> Focus: Architecture

## Top-Level Layout

```
FinalYearProject-main/
├── client/                    # React frontend (Vite root)
│   ├── index.html             # HTML entry point
│   ├── requirements.md        # Package usage notes + auth flow docs
│   ├── public/
│   │   └── favicon.png
│   └── src/
│       ├── main.tsx           # ReactDOM.createRoot entry
│       ├── App.tsx            # Router + providers + protected routes
│       ├── index.css          # Tailwind directives + CSS variables + custom utilities
│       ├── pages/             # Route-level page components
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom React hooks (auth, dashboards, toast, mobile)
│       └── lib/               # Utility functions (auth, api, cn)
│
├── server/                    # Express.js server
│   ├── index.ts               # HTTP server init + middleware
│   ├── routes.ts              # API routes (placeholder)
│   ├── storage.ts             # IStorage interface + MemStorage
│   ├── static.ts              # Production static file serving
│   └── vite.ts                # Vite dev middleware setup
│
├── shared/                    # Shared between client & server
│   ├── schema.ts              # Drizzle ORM tables + Zod schemas
│   └── routes.ts              # API route definitions + Zod validators
│
├── backend/                   # Django REST Framework backend
│   ├── manage.py              # Django management script
│   ├── seed.py                # DB seed script (admin + user accounts)
│   ├── backend/               # Django project config
│   │   ├── settings.py        # Django settings (DB, JWT, CORS, email)
│   │   ├── urls.py            # Root URL config
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/              # Auth app (User model, login, OTP)
│   │   ├── models.py          # Custom User + LoginHistory
│   │   ├── views.py           # Auth views (signup, login, OTP verify)
│   │   ├── serializers.py     # DRF serializers
│   │   ├── services.py        # OTP generation + email sending
│   │   ├── permissions.py     # Role-based permissions (IsAdminUser)
│   │   ├── urls.py            # Auth API routes
│   │   ├── admin.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── users/                 # User management app (admin CRUD)
│   │   ├── models.py          # UserProfile with UIN
│   │   ├── views.py           # User CRUD views
│   │   ├── serializers.py
│   │   ├── permissions.py
│   │   ├── urls.py
│   │   └── migrations/
│   └── identity/              # Identity management app
│       ├── models.py          # Identity, IdentityMismatch, Biometric
│       ├── views.py           # Identity CRUD, biometric verification
│       ├── serializers.py
│       ├── permissions.py
│       ├── urls.py
│       ├── utils.py           # Unified identity builder
│       ├── biometric_utils.py # Fingerprint/iris matching
│       └── migrations/
│
├── script/
│   └── build.ts               # Production build script (Vite + esbuild)
│
├── .planning/                 # Project planning (this directory)
│   └── codebase/
│       ├── STACK.md
│       ├── INTEGRATIONS.md
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       ├── CONVENTIONS.md
│       ├── TESTING.md
│       └── CONCERNS.md
│
├── attached_assets/            # Reference planning documents
├── .local/                     # Replit agent state + skill definitions
├── migrations/                 # Drizzle ORM migrations (if run)
├── dist/                       # Production build output (gitignored)
│
├── package.json                # Node.js project (name: rest-express)
├── package-lock.json
├── tsconfig.json               # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.ts           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
├── components.json              # shadcn/ui config
├── drizzle.config.ts            # Drizzle ORM config
├── pyproject.toml               # Python project config
├── main.py                      # Python placeholder script
├── uv.lock                      # Python dependency lock
├── .replit                      # Replit config
└── .gitignore
```

## Key File Locations

### Frontend Pages
| Route | File |
|---|---|
| `/` | Auto-redirect based on auth + role |
| `/login` | `client/src/pages/login.tsx` |
| `/signup` | `client/src/pages/signup.tsx` |
| `/verify-otp` | `client/src/pages/verify-otp.tsx` |
| `/user-dashboard` | `client/src/pages/user-dashboard.tsx` |
| `/admin-dashboard` | `client/src/pages/admin-dashboard.tsx` |
| *(catch-all)* | `client/src/pages/not-found.tsx` |

### API Routes
| Prefix | File |
|---|---|
| `/api/` | `backend/accounts/urls.py` |
| `/api/users/` | `backend/users/urls.py` |
| `/api/identity/` | `backend/identity/urls.py` |
| `/api/` (Express placeholder) | `server/routes.ts` |

### Component Library
| Path | Contents |
|---|---|
| `client/src/components/ui/` | 30+ shadcn/ui components (button, card, dialog, form, input, table, etc.) |
| `client/src/components/ui-elements.tsx` | Custom Input, Button, Card, Badge |
| `client/src/components/layout.tsx` | DashboardLayout (header + main + logout) |

### Hooks
| File | Hook |
|---|---|
| `hooks/use-auth.ts` | `useLogin()`, `useSignup()`, `useVerifyOtp()` |
| `hooks/use-dashboards.ts` | `useUserDashboard()`, `useAdminDashboard()` |
| `hooks/use-toast.ts` | `useToast()`, `toast()` |
| `hooks/use-mobile.tsx` | `useIsMobile()` |

## Naming Conventions
- **Frontend pages**: snake-case filenames (`verify-otp.tsx`, `user-dashboard.tsx`)
- **React components**: PascalCase exports (`Login`, `DashboardLayout`, `ProtectedRoute`)
- **API route definitions**: camelCase objects (`api.auth.login`, `api.dashboards.admin`)
- **Django apps**: lowercase (accounts, users, identity)
- **Files**: PascalCase for components, camelCase for utilities
- **DB tables**: snake_case (`login_history`, `identity_mismatch`)
- **CSS classes**: Tailwind utility classes; custom classes use kebab-case (`glass-panel`, `text-balance`, `font-display`)
