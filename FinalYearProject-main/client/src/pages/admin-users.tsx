import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { Users, Search, Plus, Loader2, Pencil, Trash2, X, UserPlus } from "lucide-react";
import { format } from "date-fns";

const API = "http://127.0.0.1:8000/api/users";

type UserData = {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  created_at: string;
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<UserData | null>(null);

  const { data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ["/api/users/list/"],
    queryFn: async () => {
      const res = await authFetch(`${API}/list/`);
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; phone_number: string }) => {
      const res = await authFetch(`${API}/create-user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err).flat().join(", ") || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/list/"] });
      setShowCreate(false);
      toast({ title: "User Created", description: "New user has been added." });
    },
    onError: (err: Error) => {
      toast({ title: "Creation Failed", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; username?: string; email?: string; phone_number?: string }) => {
      const { id, ...body } = data;
      const res = await authFetch(`${API}/update/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err).flat().join(", ") || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/list/"] });
      setEditingUser(null);
      toast({ title: "User Updated", description: "Changes saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await authFetch(`${API}/delete/${userId}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/list/"] });
      setDeletingUser(null);
      toast({ title: "User Deleted", description: "User removed from system." });
    },
    onError: (err: Error) => {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    },
  });

  const filtered = (users || []).filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage user accounts.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <UserPlus className="w-4 h-4" /> Create User
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading users...
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-8">{(error as Error).message}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{search ? "No users match your search." : "No users found."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-2 font-medium">ID</th>
                  <th className="text-left py-3 px-2 font-medium">Username</th>
                  <th className="text-left py-3 px-2 font-medium">Email</th>
                  <th className="text-left py-3 px-2 font-medium">Phone</th>
                  <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Created</th>
                  <th className="text-right py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 text-muted-foreground">{user.id}</td>
                    <td className="py-3 px-2 font-medium">{user.username}</td>
                    <td className="py-3 px-2 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-2 text-muted-foreground">{user.phone_number || "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(showCreate || editingUser) && (
        <UserFormModal
          user={editingUser}
          isCreate={showCreate}
          onClose={() => { setShowCreate(false); setEditingUser(null); }}
          onSubmit={(data) => {
            if (showCreate) createMutation.mutate(data as any);
            else updateMutation.mutate(data as any);
          }}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete User</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{deletingUser.username}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Button>
              <Button
                variant="outline"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteMutation.mutate(deletingUser.id)}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function UserFormModal({
  user, isCreate, onClose, onSubmit, isPending,
}: {
  user: UserData | null;
  isCreate: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [username, setUsername] = React.useState(user?.username || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [phone, setPhone] = React.useState(user?.phone_number || "");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setPhone(user?.phone_number || "");
    setPassword("");
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = { username, email, phone_number: phone };
    if (isCreate) {
      if (!password) return;
      onSubmit({ ...base, password });
    } else {
      onSubmit({ ...base, id: user!.id });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{isCreate ? "Create User" : "Edit User"}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {isCreate && (
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isPending}>
              {isCreate ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
