import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui-elements";
import { AlertTriangle, CheckCircle, XCircle, Loader2, Search, Shield, User } from "lucide-react";
import { format } from "date-fns";

const IDENTITY_API = "http://127.0.0.1:8000/api/identity";
const USERS_API = "http://127.0.0.1:8000/api/users";

type IdentityData = {
  id: number;
  user: number;
  identity_type: string;
  identity_number: string;
  full_name: string;
  verification_status: string;
  created_at: string;
};

type UserData = {
  id: number;
  username: string;
  email: string;
};

export default function AdminMismatches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  const { data: identitiesRes, isLoading: idLoading } = useQuery({
    queryKey: ["/api/identity/list/"],
    queryFn: async () => {
      const res = await authFetch(`${IDENTITY_API}/list/`);
      if (!res.ok) throw new Error("Failed to load identities");
      return res.json();
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery<UserData[]>({
    queryKey: ["/api/users/list/"],
    queryFn: async () => {
      const res = await authFetch(`${USERS_API}/list/`);
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const userMap = React.useMemo(() => {
    const map = new Map<number, UserData>();
    if (Array.isArray(users)) {
      users.forEach((u) => map.set(u.id, u));
    }
    return map;
  }, [users]);

  const mismatches: IdentityData[] = React.useMemo(() => {
    const list: IdentityData[] = identitiesRes?.data || identitiesRes || [];
    return list.filter((id: IdentityData) => id.verification_status === "MISMATCH");
  }, [identitiesRes]);

  const resolveMutation = useMutation({
    mutationFn: async ({ identity_id, action }: { identity_id: number; action: string }) => {
      const res = await authFetch(`${IDENTITY_API}/resolve-mismatch/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_id, action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to resolve mismatch");
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/identity/list/"] });
      toast({
        title: vars.action === "verify" ? "Identity Verified" : "Identity Rejected",
        description: `Identity has been ${vars.action === "verify" ? "verified" : "rejected"}.`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Resolution Failed", description: err.message, variant: "destructive" });
    },
  });

  const filtered = mismatches.filter((id) => {
    const user = userMap.get(id.user);
    const term = search.toLowerCase();
    return (
      id.full_name.toLowerCase().includes(term) ||
      id.identity_type.toLowerCase().includes(term) ||
      id.identity_number.toLowerCase().includes(term) ||
      user?.username.toLowerCase().includes(term) ||
      user?.email.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Identity Mismatch Resolution</h1>
        <p className="text-muted-foreground">
          Review and resolve identity records flagged with mismatched information.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search by name, type, number, or user..."
                className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 pl-9 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {mismatches.length} pending
          </Badge>
        </div>

        {idLoading || usersLoading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading mismatches...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{search ? "No mismatches match your search." : "No identity mismatches found."}</p>
            <p className="text-xs mt-1 opacity-60">All identities are in good standing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-2 font-medium">User</th>
                  <th className="text-left py-3 px-2 font-medium">Type</th>
                  <th className="text-left py-3 px-2 font-medium">Full Name</th>
                  <th className="text-left py-3 px-2 font-medium hidden md:table-cell">ID Number</th>
                  <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Created</th>
                  <th className="text-right py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((id) => {
                  const user = userMap.get(id.user);
                  return (
                    <tr key={id.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{user?.username || `User #${id.user}`}</p>
                            <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge>{id.identity_type}</Badge>
                      </td>
                      <td className="py-3 px-2 font-medium">{id.full_name}</td>
                      <td className="py-3 px-2 text-muted-foreground font-mono text-xs hidden md:table-cell">
                        {id.identity_number}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                        {format(new Date(id.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-9 px-3 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => resolveMutation.mutate({ identity_id: id.id, action: "verify" })}
                            isLoading={resolveMutation.isPending}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verify
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 px-3 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => resolveMutation.mutate({ identity_id: id.id, action: "reject" })}
                            isLoading={resolveMutation.isPending}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
