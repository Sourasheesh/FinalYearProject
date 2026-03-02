// Authentication state management and utilities

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ROLE: 'userRole',
  OTP_EMAIL: 'otpEmail'
};

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}

export function getUserRole(): string | null {
  return localStorage.getItem(AUTH_KEYS.USER_ROLE);
}

export function setAuthSession(access: string, refresh: string, role: string) {
  localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, access);
  localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refresh);
  localStorage.setItem(AUTH_KEYS.USER_ROLE, role);
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER_ROLE);
  sessionStorage.removeItem(AUTH_KEYS.OTP_EMAIL);
}

export function setOtpEmail(email: string) {
  sessionStorage.setItem(AUTH_KEYS.OTP_EMAIL, email);
}

export function getOtpEmail(): string | null {
  return sessionStorage.getItem(AUTH_KEYS.OTP_EMAIL);
}

// Wrapper for authenticated fetch requests
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, { ...options, headers });
}
