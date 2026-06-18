# Technology Stack

> Last updated: 2026-06-18
> Focus: Tech

## Frontend

### Core
| Technology | Version | Usage |
|---|---|---|
| React | 18.3.x | UI library |
| TypeScript | 5.6.3 | Type-safe JS |
| Vite | 7.3.x | Build tool & dev server |
| Wouter | 3.3.x | Client-side routing |
| TanStack React Query | 5.60.x | Server state & caching |
| react-hook-form | 7.55.x | Form state management |
| Zod | 3.24.x | Schema validation (shared frontend/backend types) |

### UI & Styling
| Technology | Usage |
|---|---|
| Tailwind CSS 3 | Utility-first CSS framework |
| shadcn/ui | Radix-based component library (`components.json`) |
| framer-motion 11 | Page transitions & micro-interactions |
| lucide-react | Icon library |
| recharts 2 | Dashboard charting |
| next-themes | Theme provider |
| date-fns 3 | Date formatting |
| react-day-picker | Calendar component |
| embla-carousel-react | Carousel component |
| class-variance-authority | Component variant management |
| tw-animate-css | Tailwind animation utilities |

### Custom UI Components
Custom components in `client/src/components/ui-elements.tsx`: Input, Button, Card, Badge — all using Tailwind + framer-motion.

### Pages
- `client/src/pages/login.tsx` — Email + password login
- `client/src/pages/signup.tsx` — Registration with role selection
- `client/src/pages/verify-otp.tsx` — 2FA OTP verification
- `client/src/pages/user-dashboard.tsx` — User login history table
- `client/src/pages/admin-dashboard.tsx` — Admin global audit log with search
- `client/src/pages/not-found.tsx` — 404 page

## Backend (Django REST Framework)

| Technology | Version | Usage |
|---|---|---|
| Python | >=3.11 | Runtime |
| Django | >=5.2.11 | Web framework |
| Django REST Framework | >=3.16.1 | REST API |
| djangorestframework-simplejwt | >=5.5.1 | JWT auth |
| django-cors-headers | >=4.9.0 | CORS handling |
| SQLite | Built-in | Development database |

### Django Apps
- **accounts** — Custom User model, login/OTP views, authentication services
- **users** — User CRUD (admin-only), UserProfile with UIN
- **identity** — Identity document management, biometric verification, mismatch detection

## Infrastructure (Express.js)

| Technology | Version | Usage |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express | 5.x | HTTP server, serves frontend |
| Drizzle ORM | 0.39.x | PostgreSQL schema management |
| pg | 8.16.x | PostgreSQL client |
| tsx | 4.x | TypeScript execution for dev |
| esbuild | 0.25.x | Server bundling for production |
| passport | 0.7.x | Auth middleware (configured but unused) |
| ws | 8.x | WebSocket support |
| connect-pg-simple | 10.x | PostgreSQL session store |
| express-session | 1.18.x | Session middleware |

### Notable Dev Dependencies
| Package | Usage |
|---|---|
| @vitejs/plugin-react | Vite React plugin |
| @tailwindcss/vite | Tailwind Vite integration |
| @tailwindcss/typography | Typography plugin |
| @replit/vite-plugin-\* | Replit-specific dev tools |
| drizzle-kit | DB migration tooling |
| cross-env | Cross-platform env vars |

## Config Locations
- `package.json` — Node project definition (name: `rest-express`)
- `tsconfig.json` — TypeScript config (strict, ESNext modules, bundler resolution)
- `vite.config.ts` — Vite config (root: `client/`, proxy `/api` -> `localhost:8000`, alias `@` -> `client/src`)
- `tailwind.config.ts` — Tailwind theme (custom colors, dark mode, border radius)
- `postcss.config.js` — PostCSS (tailwindcss + autoprefixer)
- `components.json` — shadcn/ui config (new-york style, neutral base)
- `drizzle.config.ts` — Drizzle ORM config (PostgreSQL, schema: `shared/schema.ts`)
- `pyproject.toml` — Python project definition
- `backend/backend/settings.py` — Django settings (SQLite, JWT config, console email)

## Shared Layer
- `shared/schema.ts` — Drizzle ORM schema (`users`, `login_history` tables) + Zod insert schemas
- `shared/routes.ts` — API route definitions with Zod validation schemas (`api.auth`, `api.dashboards`)
