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
  },
  identity: {
    create: {
      method: 'POST' as const,
      path: '/api/identity/create/' as const,
      input: z.object({
        user: z.number(),
        identity_type: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE']),
        identity_number: z.string(),
        full_name: z.string(),
        father_name: z.string(),
        mother_name: z.string(),
        gender: z.string(),
        date_of_birth: z.string(),
        nationality: z.string().default('Indian'),
        address: z.string(),
        email: z.string().email(),
        phone: z.string(),
        status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']).default('ACTIVE'),
      }),
      responses: {
        201: z.object({}),
        400: errorSchemas.validation,
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/identity/list/' as const,
      responses: {
        200: z.object({ count: z.number(), data: z.array(z.any()) }),
        403: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/identity/update/' as const,
      input: z.object({
        id: z.number(),
        user: z.number().optional(),
        identity_type: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE']).optional(),
        identity_number: z.string().optional(),
        full_name: z.string().optional(),
        father_name: z.string().optional(),
        mother_name: z.string().optional(),
        gender: z.string().optional(),
        date_of_birth: z.string().optional(),
        nationality: z.string().optional(),
        address: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']).optional(),
      }),
      responses: {
        200: z.object({}),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/identity/delete/' as const,
      input: z.object({
        id: z.number(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      }
    },
    unifiedCard: {
      method: 'GET' as const,
      path: '/api/identity/unified-card/' as const,
      responses: {
        200: z.object({ uin: z.string().nullable(), user: z.any(), primary_identity: z.any(), linked_identities: z.array(z.any()), biometric: z.any() }),
        403: errorSchemas.validation,
      }
    },
    userIdentities: {
      method: 'GET' as const,
      path: '/api/identity/user/:uin/' as const,
      responses: {
        200: z.object({ uin: z.string(), identities: z.array(z.any()) }),
        404: errorSchemas.notFound,
      }
    },
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
