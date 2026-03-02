import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type ApiError = { message: string; is_locked?: boolean; status: number };

async function handleApiResponse(res: Response) {
  if (!res.ok) {
    let errData: any = {};
    try {
      errData = await res.json();
    } catch {
      errData = { message: "An unexpected error occurred" };
    }
    throw { status: res.status, ...errData } as ApiError;
  }
  return res.json();
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.signup.input>) => {
      const res = await fetch(api.auth.signup.path, {
        method: api.auth.signup.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.verifyOtp.input>) => {
      const res = await fetch(api.auth.verifyOtp.path, {
        method: api.auth.verifyOtp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}
