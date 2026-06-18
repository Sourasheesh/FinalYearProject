import * as React from "react";
import { useLocation } from "wouter";
import { useVerifyBiometric } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { setAuthSession, getAuthToken } from "@/lib/auth";
import { Button, Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { Fingerprint, Scan, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

export default function VerifyBiometric() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const verifyMutation = useVerifyBiometric();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [mode, setMode] = React.useState<"fingerprint" | "iris">("fingerprint");

  const userId = sessionStorage.getItem("biometricUserId");

  React.useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const role = localStorage.getItem("userRole");
      setLocation(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    }
  }, [setLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please upload a biometric image.", variant: "destructive" });
      return;
    }
    if (!userId) {
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
      setLocation("/login");
      return;
    }

    const formData = new FormData();
    formData.append("user", userId);
    formData.append(mode, selectedFile);

    verifyMutation.mutate(formData, {
      onSuccess: (res) => {
        if (res.access_token && res.refresh_token) {
          const role = res.role || sessionStorage.getItem("biometricUserRole") || localStorage.getItem("userRole") || "user";
          setAuthSession(res.access_token, res.refresh_token, role);
          sessionStorage.removeItem("biometricUserId");
          sessionStorage.removeItem("biometricUserRole");
          toast({ title: "Biometric Verified", description: res.message || "Identity confirmed." });
          setLocation(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        } else {
          toast({ title: "Verification Failed", description: "No token received.", variant: "destructive" });
        }
      },
      onError: (err: any) => {
        toast({
          title: "Biometric Verification Failed",
          description: err.message || "Scan did not match. Try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => setLocation("/login")}
          className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </button>

        <Card className="p-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <Fingerprint className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Biometric Verification</h1>
            <p className="text-sm text-muted-foreground text-balance">
              As an additional security measure, please scan your biometric to verify your identity.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "fingerprint" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("fingerprint")}
              type="button"
            >
              <Fingerprint className="w-4 h-4 mr-2" /> Fingerprint
            </Button>
            <Button
              variant={mode === "iris" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("iris")}
              type="button"
            >
              <Scan className="w-4 h-4 mr-2" /> Iris Scan
            </Button>
          </div>

          <div
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {mode === "fingerprint" ? (
                  <Fingerprint className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                ) : (
                  <Scan className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                )}
                <p className="text-sm text-muted-foreground">
                  Click to upload {mode === "fingerprint" ? "fingerprint" : "iris"} image
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Supported: JPG, PNG
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <Button
            className="w-full"
            onClick={onSubmit}
            isLoading={verifyMutation.isPending}
            disabled={!selectedFile}
          >
            {verifyMutation.isPending ? (
              <>Verifying...</>
            ) : (
              <>Verify Identity</>
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
