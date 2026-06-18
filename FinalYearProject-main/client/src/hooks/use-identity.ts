import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function useIdentities() {
  return useQuery({
    queryKey: [api.identity.list.path],
    queryFn: async () => {
      const res = await authFetch(api.identity.list.path);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        throw new Error("Failed to load identities");
      }
      return res.json();
    },
    retry: false
  });
}

export function useUnifiedIdentityCard() {
  return useQuery({
    queryKey: [api.identity.unifiedCard.path],
    queryFn: async () => {
      const res = await authFetch(api.identity.unifiedCard.path);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        throw new Error("Failed to load identity card");
      }
      return res.json();
    },
    retry: false
  });
}

export function useUserIdentities(uin: string) {
  return useQuery({
    queryKey: [api.identity.userIdentities.path, uin],
    queryFn: async () => {
      const url = api.identity.userIdentities.path.replace(':uin', uin);
      const res = await authFetch(url);
      if (!res.ok) {
        if (res.status === 404) throw new Error("User not found");
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        throw new Error("Failed to load user identities");
      }
      return res.json();
    },
    enabled: !!uin,
    retry: false
  });
}

export function useCreateIdentity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authFetch(api.identity.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to create identity" }));
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.identity.list.path] });
      toast({ title: "Identity Created", description: "Identity record has been created successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Creation Failed", description: err.message || "Failed to create identity.", variant: "destructive" });
    }
  });
}

export function useUpdateIdentity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await authFetch(api.identity.update.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to update identity" }));
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.identity.list.path] });
      toast({ title: "Identity Updated", description: "Identity record has been updated." });
    },
    onError: (err: any) => {
      toast({ title: "Update Failed", description: err.message || "Failed to update identity.", variant: "destructive" });
    }
  });
}

export function useDeleteIdentity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await authFetch(api.identity.delete.path, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to delete identity" }));
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.identity.list.path] });
      toast({ title: "Identity Deleted", description: "Identity record has been deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Deletion Failed", description: err.message || "Failed to delete identity.", variant: "destructive" });
    }
  });
}
