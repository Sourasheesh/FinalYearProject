import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Input } from "@/components/ui-elements";
import { User, Save, Loader2 } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const updateMutation = useMutation({
    mutationFn: async (data: { username?: string; email?: string; phone_number?: string }) => {
      const res = await authFetch("http://127.0.0.1:8000/api/users/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err).flat().join(", ") || "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = {};
    if (username.trim()) body.username = username.trim();
    if (email.trim()) body.email = email.trim();
    if (phone.trim()) body.phone_number = phone.trim();
    if (Object.keys(body).length === 0) return;
    updateMutation.mutate(body);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Update your account information.</p>
      </div>

      <div className="max-w-lg">
        <Card className="p-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <User className="w-7 h-7 text-primary" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="New username"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="New email address"
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="New phone number"
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
