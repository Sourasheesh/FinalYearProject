# Coding Conventions

> Last updated: 2026-06-18
> Focus: Quality

## TypeScript / React

### Code Style
- **Type safety**: Strict TypeScript mode (`tsconfig.json` — `strict: true`)
- **Imports**: ES module style with path aliases (`@/` → `client/src/`, `@shared/` → `shared/`)
- **Destructuring**: React hooks imported via destructuring (`useLocation`, `useForm`, `useToast`)
- **Exports**: Default exports for page components (`export default function Login()`)
- **Ref forwarding**: `React.forwardRef` for reusable input components (`client/src/components/ui-elements.tsx:7`)
- **CSS approach**: Tailwind utility classes exclusively; no CSS modules or styled-components

### Component Patterns
```
export default function ComponentName() {
  // Hooks at top
  // Event handlers in middle
  // JSX return at bottom
}
```

### Form Handling Pattern
```
const { register, handleSubmit, formState: { errors } } = useForm<FormType>({
  resolver: zodResolver(api.auth.login.input)
});
```

### Auth/Auth Pattern
```
const ProtectedRoute = ({ component: Component, allowedRole }) => {
  const token = getAuthToken();
  const role = getUserRole();
  if (!token) return <Redirect to="/login" />;
  if (allowedRole && role !== allowedRole) return <Redirect to="/login" />;
  return <Component />;
};
```

### Error Handling
- **React Query mutations**: errors caught in `onError` callback → displayed via `toast()`
- **API fetches**: `authFetch()` wraps fetch with JWT header; dashboard hooks check for 401/403
- **Forms**: Zod validation errors rendered per-field (`errors.email?.message`)
- **Django**: DRF APIView returns structured error responses with status codes

### UI Patterns
- Framer Motion for page/component entrance animations (`initial`, `animate`, `transition`)
- Lucide icons prefixed with icon name in imports (`import { ShieldCheck, ArrowRight } from "lucide-react"`)
- Glass-morphism: `glass-panel` utility class (`bg-white/70 backdrop-blur-xl`)
- Consistent border radius: `rounded-2xl`, `rounded-xl`, `rounded-full`

## Django / Python

### App Structure
- Each app has: `models.py`, `views.py`, `serializers.py`, `urls.py`, `permissions.py`, `admin.py`, `tests.py`
- Views extend `rest_framework.views.APIView`
- Permission classes: `IsAuthenticated` + custom `IsAdmin` / `IsAdminUser`
- API endpoints use trailing slashes (Django convention)

### Model Patterns
```
class ModelName(models.Model):
    field = models.FieldType(options)
    class Meta:
        verbose_name = "..."
```

## Dependencies & Imports
- `@tanstack/react-query` for server state (no Redux)
- `wouter` for routing (lightweight, no react-router)
- `zod` for validation (shared between frontend and backend types)
- `date-fns` for date formatting (no moment.js)
- `clsx` + `tailwind-merge` via `cn()` utility for conditional classes

## File Organization
- One component per file (pages, hooks, UI components)
- Pages in `client/src/pages/`
- Hooks in `client/src/hooks/`
- Utility in `client/src/lib/`
- Shared code in `shared/`

## Shell Scripts
- `npm run dev` — starts Express + Vite dev
- `npm run build` — production build (Vite client + esbuild server bundle)
- `npm run check` — TypeScript type checking (`tsc`)
- `npm run db:push` — Drizzle schema push to PostgreSQL

## Misc
- `displayName` set on forwarded-ref components
- `as const` assertions for literal types (`method: 'POST' as const`)
- `satisfies` operator for type validation without widening (`tailwind.config.ts`)
