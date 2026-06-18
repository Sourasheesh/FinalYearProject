import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth";
import { useUploadBiometric } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui-elements";
import { Fingerprint, Scan, Upload, CheckCircle, Loader2 } from "lucide-react";

export default function AdminBiometric() {
  const { toast } = useToast();
  const uploadMutation = useUploadBiometric();
  const [selectedUser, setSelectedUser] = React.useState<string>("");
  const [fingerprintFile, setFingerprintFile] = React.useState<File | null>(null);
  const [irisFile, setIrisFile] = React.useState<File | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users/list/"],
    queryFn: async () => {
      const res = await authFetch("http://127.0.0.1:8000/api/users/list/");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const handleUpload = () => {
    if (!selectedUser) {
      toast({ title: "No user selected", description: "Select a user to enroll biometrics.", variant: "destructive" });
      return;
    }
    if (!fingerprintFile && !irisFile) {
      toast({ title: "No files", description: "Upload at least one biometric image.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("user", selectedUser);
    if (fingerprintFile) formData.append("fingerprint", fingerprintFile);
    if (irisFile) formData.append("iris", irisFile);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Biometric Stored", description: "Biometric data saved successfully." });
        setFingerprintFile(null);
        setIrisFile(null);
      },
      onError: (err: any) => {
        toast({ title: "Upload Failed", description: err.message || "Failed to store biometric.", variant: "destructive" });
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Biometric Enrollment</h1>
        <p className="text-muted-foreground">Register fingerprint or iris scans for users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <h3 className="font-semibold text-lg">Select User</h3>

          {usersLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
            </div>
          ) : (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
            >
              <option value="">-- Select a user --</option>
              {Array.isArray(users) && users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email})
                </option>
              ))}
            </select>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-2">
                <Fingerprint className="w-4 h-4 inline mr-1" /> Fingerprint Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFingerprintFile(e.target.files?.[0] || null)}
                className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              {fingerprintFile && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {fingerprintFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-2">
                <Scan className="w-4 h-4 inline mr-1" /> Iris Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setIrisFile(e.target.files?.[0] || null)}
                className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              {irisFile && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {irisFile.name}
                </p>
              )}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleUpload}
            isLoading={uploadMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-2" /> Store Biometric
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Enrollment Guide</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">1.</span>
              Select the target user from the dropdown.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">2.</span>
              Upload a clear fingerprint image (JPG/PNG).
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">3.</span>
              Upload a clear iris scan image (JPG/PNG).
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">4.</span>
              Click "Store Biometric" to save.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">5.</span>
              At least one biometric type (fingerprint or iris) is required.
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
