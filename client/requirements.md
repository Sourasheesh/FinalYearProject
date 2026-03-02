## Packages
framer-motion | Page transitions and highly polished micro-interactions
jwt-decode | Safely parse JSON Web Tokens for client-side auth state
date-fns | Human-readable date formatting for login history dashboards
lucide-react | Beautiful, consistent icons for UI elements

## Notes
- Authentication uses a standard JWT flow. Tokens are stored in `localStorage` (`accessToken`, `refreshToken`, `userRole`).
- API requests to authenticated endpoints (`/api/user/dashboard/`, `/api/admin/dashboard/`) use the `Authorization: Bearer <token>` header.
- The Wouter routing checks these tokens to protect dashboard routes and automatically redirect unauthenticated users.
- Email state during the 2-step Login -> OTP flow is temporarily held in `sessionStorage` (`otpEmail`).
