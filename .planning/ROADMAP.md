# Roadmap: SecureApp

**Created:** 2026-06-18
**Phases:** 3 | **v1 Requirements:** 18 | **Coverage:** 100% ✓

## Phase 1: Identity Document Management

**Goal:** Users and admins can create, view, update, and delete identity documents (Aadhaar, PAN, Passport, Voter ID, Driving License) with verification status tracking.
**Mode:** mvp

**Requirements:**
- IDENT-01, IDENT-02, IDENT-03, IDENT-04, IDENT-05, IDENT-06
- NAV-01

**Success Criteria:**
1. Admin can create identity records for all 5 document types with all fields
2. User can view their linked identities with verification status badges
3. Admin can update and delete identity records
4. User can view their unified identity card with primary identity and biometric status
5. Admin identity list is searchable and paginated
6. Identity pages match the existing design language

---

## Phase 2: Biometric Verification

**Goal:** Users can register biometric templates (fingerprint and iris) and verify their identity via biometrics during the login flow.
**Mode:** mvp

**Requirements:**
- BIO-01, BIO-02, BIO-03, BIO-04, BIO-05
- NAV-02

**Success Criteria:**
1. User can upload fingerprint template from the biometric page
2. User can upload iris template from the biometric page
3. After OTP verification, non-admin users see biometric verification screen
4. Successful biometric verification redirects to user dashboard
5. Failed biometric verification shows clear error message with retry option
6. Biometric upload form shows registration status (registered/not registered)

---

## Phase 3: Admin User Management

**Goal:** Admins can manage user accounts with full CRUD operations from a dedicated interface.
**Mode:** mvp

**Requirements:**
- ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
- NAV-03

**Success Criteria:**
1. Admin can view paginated list of all users with search
2. Admin can create new user accounts (email, username, role, phone)
3. Admin can update existing user details
4. Admin can delete users with confirmation dialog
5. Navigation integrates into admin dashboard sidebar

---

## Phase Dependencies

```
Phase 1 (Identity) ──→ Phase 2 (Biometric) ──→ Phase 3 (Admin)
       │                      │                       │
       │ (NAV-01)             │ (NAV-02)              │ (NAV-03)
       ▼                      ▼                       ▼
   Shared: hooks,        Shared: auth flow        Shared: user
   API types             integration              management API
```

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| IDENT-01 | Phase 1 | Pending |
| IDENT-02 | Phase 1 | Pending |
| IDENT-03 | Phase 1 | Pending |
| IDENT-04 | Phase 1 | Pending |
| IDENT-05 | Phase 1 | Pending |
| IDENT-06 | Phase 1 | Pending |
| NAV-01 | Phase 1 | Pending |
| BIO-01 | Phase 2 | Pending |
| BIO-02 | Phase 2 | Pending |
| BIO-03 | Phase 2 | Pending |
| BIO-04 | Phase 2 | Pending |
| BIO-05 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| ADMIN-01 | Phase 3 | Pending |
| ADMIN-02 | Phase 3 | Pending |
| ADMIN-03 | Phase 3 | Pending |
| ADMIN-04 | Phase 3 | Pending |
| NAV-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓
