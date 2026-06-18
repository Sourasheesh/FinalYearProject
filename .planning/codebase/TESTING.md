# Testing

> Last updated: 2026-06-18
> Focus: Quality

## Current State

**No test infrastructure is configured for the frontend or Express server.**

The `tsconfig.json:3` explicitly excludes test files:
```
"exclude": ["node_modules", "build", "dist", "**/*.test.ts"]
```

The `package.json` does not include any test scripts or test runner dependencies (no vitest, jest, mocha, etc.).

## Django Backend Tests

The Django apps include skeleton test files, but they appear to be empty/generated:
- `backend/accounts/tests.py`
- `backend/users/tests.py`
- `backend/identity/tests.py`

No test runner configuration or actual test cases were found in these files.

## What Exists

| File | Status |
|---|---|
| `**/*.test.ts` | Excluded from tsconfig — none found |
| `__tests__/` directories | None found |
| Test runner in `package.json` | Not present |
| CI configuration | None found |
| Django `tests.py` files | Present but empty/generated |

## Recommendations

1. **Add a test runner** — vitest is the natural choice for Vite-based projects
2. **Test the auth hooks** — `useLogin`, `useSignup`, `useVerifyOtp` mutations
3. **Test the protected route wrapper** — `ProtectedRoute` component with mock auth state
4. **Test form validation** — Zod schemas from `shared/routes.ts`
5. **Test Django API views** — account signup/login flows, OTP verification
6. **Add end-to-end tests** — full auth flow (login → OTP → dashboard redirect)
