# Plan: Identity Document Management

**Phase:** 1
**Mode:** mvp
**Goal:** Users and admins can create, view, update, and delete identity documents (Aadhaar, PAN, Passport, Voter ID, Driving License) with verification status tracking.
**Requirements:** IDENT-01, IDENT-02, IDENT-03, IDENT-04, IDENT-05, IDENT-06, NAV-01

## Wave 1: Foundation — Identity API Hooks & Types

### Task 1.1: Define identity TypeScript types and API route definitions

<read_first>
- `client/src/hooks/use-dashboards.ts` — Pattern for authenticated API hooks
- `shared/routes.ts` — Existing API route definitions with Zod schemas
- `client/src/lib/auth.ts` — authFetch pattern for authenticated requests
</read_first>

<action>
Add identity API route definitions to `shared/routes.ts` under a new `api.identity` namespace:
- POST `/api/identity/create/` input: all Identity model fields
- PUT `/api/identity/update/` input: identity id + partial fields
- DELETE `/api/identity/delete/` input: identity id
- GET `/api/identity/list/` response: array of identities
- GET `/api/identity/unified-card/` response: unified identity card data
- GET `/api/identity/user/<uin>/` response: user identities by UIN

Define Zod schemas matching the Django Identity model:
- identity_type enum: AADHAAR, PAN, PASSPORT, VOTER_ID, DRIVING_LICENSE
- verification_status enum: PENDING, VERIFIED, MISMATCH, REJECTED
- All fields: identity_number, full_name, father_name, mother_name, gender, date_of_birth, nationality, address, email, phone
</action>

<acceptance_criteria>
- `shared/routes.ts` contains `api.identity` namespace with all endpoints
- Each endpoint has typed input/output Zod schemas
- TypeScript compiles without errors (`npm run check`)
</acceptance_criteria>

---

### Task 1.2: Create identity data hooks (use-identity.ts)

<read_first>
- `client/src/hooks/use-auth.ts` — Pattern for API mutation hooks
- `client/src/hooks/use-dashboards.ts` — Pattern for authenticated query hooks
- `client/src/lib/auth.ts` — authFetch wrapper
</read_first>

<action>
Create `client/src/hooks/use-identity.ts` with hooks:
- `useIdentities()` — GET `/api/identity/list/` query (admin), uses authFetch
- `useUnifiedIdentityCard()` — GET `/api/identity/unified-card/` query (authenticated user), uses authFetch
- `useUserIdentities(uin)` — GET `/api/identity/user/<uin>/` query
- `useCreateIdentity()` — POST `/api/identity/create/` mutation with react-query
- `useUpdateIdentity()` — PUT `/api/identity/update/` mutation
- `useDeleteIdentity()` — DELETE `/api/identity/delete/` mutation

Follow the same pattern as `use-dashboards.ts` — useQuery for GET, useMutation for POST/PUT/DELETE. Use `authFetch` for all requests.
</action>

<acceptance_criteria>
- `client/src/hooks/use-identity.ts` exists with 6 hooks
- Each GET hook uses `useQuery` from @tanstack/react-query
- Each mutation uses `useMutation`
- All requests use `authFetch` with proper error handling
</acceptance_criteria>

---

## Wave 2: Admin Identity List & Create

### Task 2.1: Admin identity management layout

<read_first>
- `client/src/components/layout.tsx` — DashboardLayout pattern
- `client/src/pages/admin-dashboard.tsx` — Admin page patterns
</read_first>

<action>
Create `client/src/components/identity/IdentityLayout.tsx` — shared layout for admin identity pages:
- Wraps content in DashboardLayout
- Heading "Identity Management" with descriptive subtitle
- Subtle glass-panel card container matching the existing design
</action>

<acceptance_criteria>
- `client/src/components/identity/IdentityLayout.tsx` exists
- Uses DashboardLayout from `@/components/layout`
- Matches existing admin page styling (glass panels, headings, spacing)
</acceptance_criteria>

---

### Task 2.2: Admin identity list page with search

<read_first>
- `client/src/pages/admin-dashboard.tsx` — Existing table + search pattern
- `client/src/hooks/use-identity.ts` — Identity hooks (from task 1.2)
</read_first>

<action>
Create `client/src/pages/identity-list.tsx`:
- Uses `useIdentities()` hook to fetch all identity records
- Shows table with columns: identity_type, identity_number, full_name, verification_status, status, created_at
- Verification status rendered as Badge components (PENDING=default, VERIFIED=success, MISMATCH=destructive, REJECTED=destructive)
- Search bar filtering by identity_number or full_name
- Pagination if >20 results (client-side pagination)
- "Create Identity" button linking to create page
- Loading state with Loader2 spinner
- Error state with destructive alert
- Empty state with helpful message
</action>

<acceptance_criteria>
- `client/src/pages/identity-list.tsx` exists
- Table shows all identity fields with status badges
- Search filters by identity number and full name
- Loading/error/empty states rendered
- Create button present and styled matching admin dashboard
</acceptance_criteria>

---

### Task 2.3: Identity creation form

<read_first>
- `client/src/pages/signup.tsx` — Form pattern with react-hook-form + zod
- `client/src/pages/login.tsx` — Input/Button usage pattern
- `client/src/components/ui-elements.tsx` — Available UI components
</read_first>

<action>
Create `client/src/pages/identity-create.tsx`:
- Uses react-hook-form with zodResolver
- Form fields: user (select dropdown of users), identity_type (select: AADHAAR, PAN, PASSPORT, VOTER_ID, DRIVING_LICENSE), identity_number, full_name, father_name, mother_name, gender (select), date_of_birth (date input), nationality, address (textarea), email, phone
- Half-width fields in a 2-column grid for compact layout
- Uses existing Input component for text fields, native select for dropdowns
- On submit: calls `useCreateIdentity()` mutation
- On success: toast notification + redirect to identity list
- On error: toast with error message
- Cancel button that navigates back to list
</action>

<acceptance_criteria>
- `client/src/pages/identity-create.tsx` exists
- All 12+ form fields present and labeled
- Zod validation matches backend required fields
- Submit creates identity and redirects to list
- Error/success toasts shown
</acceptance_criteria>

---

## Wave 3: Admin Edit/Delete & Detail View

### Task 3.1: Identity edit form

<read_first>
- `client/src/pages/identity-create.tsx` — Create form pattern
- `client/src/pages/signup.tsx` — Form handling pattern
</read_first>

<action>
Create `client/src/pages/identity-edit.tsx`:
- Loads existing identity data (passed via route param or fetched)
- Same form fields as create but pre-populated with existing values
- Uses `useUpdateIdentity()` mutation on submit
- Partial update — only changed fields sent
- On success: toast + redirect to identity list
- On error: toast with error message
</action>

<acceptance_criteria>
- `client/src/pages/identity-edit.tsx` exists
- Pre-populates form with existing identity data
- Partial update works correctly
- Redirects to list on success
</acceptance_criteria>

---

### Task 3.2: Identity detail/view page

<read_first>
- `client/src/components/ui-elements.tsx` — Card, Badge components
- `client/src/pages/user-dashboard.tsx` — Detail display patterns
</read_first>

<action>
Create `client/src/pages/identity-detail.tsx`:
- Displays full identity record in a read-only card layout
- Two-column grid: identity_type badge, identity_number, full_name, father_name, mother_name, gender, date_of_birth, age, nationality, address, email, phone, verification_status badge, status badge, created_at
- Edit and Delete action buttons at top
- Delete button shows confirmation dialog
- On delete: confirm dialog → `useDeleteIdentity()` → toast + redirect to list
- Verification status visually prominent (colored banner at top)
</action>

<acceptance_criteria>
- `client/src/pages/identity-detail.tsx` exists
- All identity fields displayed in organized layout
- Edit and Delete buttons present and functional
- Delete confirmation dialog works
</acceptance_criteria>

---

## Wave 4: User Unified Identity Card

### Task 4.1: User identity card page

<read_first>
- `client/src/pages/user-dashboard.tsx` — User page patterns
- `client/src/hooks/use-identity.ts` — useUnifiedIdentityCard hook
- `backend/identity/views.py` — UnifiedIdentityCard response structure
</read_first>

<action>
Create `client/src/pages/identity-card.tsx`:
- Uses `useUnifiedIdentityCard()` hook to fetch data
- Displays unified identity card in a premium card layout:
  - User info section: name, gender, DOB, nationality, UIN
  - Primary identity section: type, number, verification status
  - Linked identities section: list of all linked identity types with status badges
  - Biometric section: shows fingerprint/iris registration status (registered/not registered)
- Status badges matching existing Badge component variants
- Loading state with Loader2
- Error state
- "No identities linked" empty state with prompt to contact admin
</action>

<acceptance_criteria>
- `client/src/pages/identity-card.tsx` exists
- Shows all sections from the unified card API response
- Bio registration status shown for fingerprint and iris
- Matches user-dashboard design patterns
- Loading/error/empty states present
</acceptance_criteria>

---

## Wave 5: Routing & Navigation Integration

### Task 5.1: Add identity routes to App.tsx

<read_first>
- `client/src/App.tsx` — Existing route structure and ProtectedRoute pattern
</read_first>

<action>
Add routes to `client/src/App.tsx`:
- `/admin/identities` → IdentityList (protected, admin only)
- `/admin/identities/create` → IdentityCreate (protected, admin only)
- `/admin/identities/:id` → IdentityDetail (protected, admin only)
- `/admin/identities/:id/edit` → IdentityEdit (protected, admin only)
- `/identity-card` → IdentityCard (protected, any authenticated user)

Import all identity page components at top of file.
</action>

<acceptance_criteria>
- All 5 identity routes registered in App.tsx
- Admin routes use `allowedRole="admin"` on ProtectedRoute
- User identity card route accessible by both roles
- Root redirect still works correctly
</acceptance_criteria>

---

### Task 5.2: Add navigation links in admin and user dashboards

<read_first>
- `client/src/components/layout.tsx` — Dashboard header pattern
- `client/src/pages/admin-dashboard.tsx` — Admin page
- `client/src/pages/user-dashboard.tsx` — User page
</read_first>

<action>
Update admin dashboard page:
- Add "Identity Management" navigation link in admin area (above logout button in layout or as section in admin page)
- Link to `/admin/identities`
- Uses ShieldCheck or FileText icon from lucide-react

Update user dashboard page:
- Add "My Identity Card" navigation link
- Link to `/identity-card`
- Uses IdCard or ShieldCheck icon

Style links matching the existing nav/sidebar pattern.
</action>

<acceptance_criteria>
- Admin can navigate to identity management from admin area
- User can navigate to identity card from user area
- Links match design language (icons, hover states, spacing)
</acceptance_criteria>

---

## Artifacts this Phase Produces

- `shared/routes.ts` — Extended with `api.identity` namespace (Zod schemas)
- `client/src/hooks/use-identity.ts` — 6 React Query hooks
- `client/src/components/identity/IdentityLayout.tsx` — Shared layout
- `client/src/pages/identity-list.tsx` — Admin identity list
- `client/src/pages/identity-create.tsx` — Identity creation form
- `client/src/pages/identity-edit.tsx` — Identity edit form
- `client/src/pages/identity-detail.tsx` — Identity detail view
- `client/src/pages/identity-card.tsx` — User unified identity card
- `client/src/App.tsx` — Updated with 5 new routes
- `client/src/pages/admin-dashboard.tsx` — Updated with identity nav link
- `client/src/pages/user-dashboard.tsx` — Updated with identity card nav link

## Verification Criteria

1. All 5 identity pages are accessible via their routes
2. Identity CRUD operations succeed against the Django API
3. Search filters work on identity list
4. Form validation prevents invalid submissions
5. Unified identity card displays all data sections
6. Navigation links route to correct pages
7. Protected routes block unauthenticated access
8. No TypeScript errors (`npm run check`)

## Dependencies

- Requires Django backend running on port 8000 with identity API endpoints
- Requires npm packages: none new (react-hook-form, zod, lucide-react already installed)
- Follows existing patterns: authFetch, react-query hooks, shared routes, ProtectedRoute
