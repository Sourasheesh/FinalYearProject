import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "@/lib/auth";

export function useUserDashboard() {
  return useQuery({
    queryKey: [api.dashboards.user.path],
    queryFn: async () => {
      const res = await authFetch(api.dashboards.user.path);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        throw new Error("Failed to load dashboard data");
      }
      return res.json();
    },
    retry: false
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: [api.dashboards.admin.path],
    queryFn: async () => {
      const res = await authFetch(api.dashboards.admin.path);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        throw new Error("Failed to load admin data");
      }
      return res.json();
    },
    retry: false
  });
}
