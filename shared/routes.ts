import { z } from 'zod';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/signup/' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
        role: z.enum(['user', 'admin']).default('user'),
      }),
      responses: {
        201: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      }
    },
    verifyEmail: {
      method: 'GET' as const,
      path: '/api/verify-email/:token/' as const,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/login/' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string()
      }),
      responses: {
        200: z.object({ message: z.string() }), // OTP sent
        401: z.object({ message: z.string(), is_locked: z.boolean().optional() }),
      }
    },
    verifyOtp: {
      method: 'POST' as const,
      path: '/api/verify-otp/' as const,
      input: z.object({
        email: z.string().email(),
        otp: z.string()
      }),
      responses: {
        200: z.object({ access: z.string(), refresh: z.string(), role: z.enum(['user', 'admin']) }),
        401: z.object({ message: z.string() })
      }
    }
  },
  dashboards: {
    user: {
      method: 'GET' as const,
      path: '/api/user/dashboard/' as const,
      responses: {
        200: z.object({ message: z.string(), history: z.array(z.any()) }),
        403: errorSchemas.validation
      }
    },
    admin: {
      method: 'GET' as const,
      path: '/api/admin/dashboard/' as const,
      responses: {
        200: z.object({ message: z.string(), all_history: z.array(z.any()) }),
        403: errorSchemas.validation
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
