import { useMutation } from "@tanstack/react-query";

type ApiError = { message: string; is_locked?: boolean; status: number };

const API_BASE = "http://127.0.0.1:8000/api";

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
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await fetch(`${API_BASE}/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useVerifyLoginOtp() {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await fetch(`${API_BASE}/verify-login-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useVerifyBiometric() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`${API_BASE}/identity/verify-biometric/`, {
        method: "POST",
        body: data,
      });
      return handleApiResponse(res);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await fetch(`${API_BASE}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string; new_password: string }) => {
      const res = await fetch(`${API_BASE}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleApiResponse(res);
    },
  });
}

export function useUploadBiometric() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/identity/upload-biometric/`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: data,
      });
      return handleApiResponse(res);
    },
  });
}