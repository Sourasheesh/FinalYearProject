# Project State

## Goal
Fix signup flow, user listing, and UserProfile creation bugs; add admin mismatch resolution UI.

## Constraints & Preferences
- All changes inline, no subagents, no extra planning files.
- Conventional commit format (`fix:`, `feat:`, etc.).
- Biometric matching uses ORB features (>20 fingerprint, >15 iris).

## Progress
### Done
- Created `admin-biometric.tsx` — enrollment page with user dropdown + fingerprint/iris file upload and error display.
- Added biometric enrollment link to `admin-dashboard.tsx`.
- Fixed `verifyMutation is not defined` bug in `verify-otp.tsx` (mutations stored as `signupVerifyMutation`/`loginVerifyMutation`).
- Fixed `UploadBiometric` view: returns error when zero ORB features extracted (prevents silent empty record save).
- Fixed frontend error display: reads `err.error` (Django field) in addition to `err.message`.
- Created `admin-users.tsx` — full CRUD page (list, create/edit modals, delete confirm).
- Added `/admin/users` route and link in `admin-dashboard.tsx`.
- Created `UpdateOwnProfileView` (`PUT /api/users/profile/`) — self-service profile edit with `partial=True`.
- Created `profile.tsx` — profile edit form, added `/profile` route and link in `user-dashboard.tsx`.
- Fixed missing `UpdateOwnProfileView` import in `users/urls.py` (was causing `NameError`).
- Created `admin-mismatches.tsx` — identity mismatch resolution page (lists MISMATCH identities, Verify/Reject buttons).
- Added `/admin/mismatches` route and link in `admin-dashboard.tsx`.
- **Fixed signup endpoint**: Added `SignupView` + `SignupSerializer` at `POST /api/signup/` (previously only `/api/admin/signup` existed; frontend was calling `/api/signup/` → 404).
- **Fixed UserProfile creation**: `SignupSerializer.create()` and `AdminSignupSerializer.create()` now create a `UserProfile` alongside the `User` — without this, `UserListSerializer` (which accesses `profile.phone_number`) crashed with `RelatedObjectDoesNotExist` on newly signed-up users, hiding them from the biometric dropdown.
- **Fixed user listing**: `UserListView` changed from `User.objects.filter(role="user")` to `User.objects.all()` so all users (including admins) appear in the biometric enrollment dropdown.
- **Configured SMTP email sending**: Added `python-dotenv`, SMTP env vars, `DEFAULT_FROM_EMAIL` fallback; OTP can now be sent via real SMTP instead of console.
- **Added forgot/reset password flow**: `ForgotPasswordRequestView` sends OTP to email, `ResetPasswordView` verifies OTP + sets new password with validation. Frontend pages at `/forgot-password` and `/reset-password`.

## Key Decisions
- `SignupSerializer` auto-derives username from email prefix (no separate username field in signup form).
- `UserListView` returns all users (not just `role="user"`) so the biometric dropdown shows every signed-up account.
- `UserProfile` is created with empty `phone_number` during signup (phone not collected at registration time).

## Critical Context
- `db.sqlite3` is tracked in git and changes on every `python seed.py` run.
- OTP sending uses SMTP when `EMAIL_HOST_USER` is set in `.env`; falls back to console backend otherwise.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | configure SMTP email sending | 2026-06-19 | 1e0b6d9 | - |
| 2 | add forgot/reset password flow | 2026-06-19 | adedfc5 | - |
