import * as React from "react";
import { useUnifiedIdentityCard } from "@/hooks/use-identity";
import { DashboardLayout } from "@/components/layout";
import { Card, Badge } from "@/components/ui-elements";
import { Loader2, ShieldCheck, Fingerprint, Eye, FileText, User, CreditCard } from "lucide-react";

export default function IdentityCard() {
  const { data, isLoading, error } = useUnifiedIdentityCard();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p>Loading your identity card...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
          <ShieldCheck className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Unable to Load Identity Card</h2>
          <p className="text-destructive/80">{(error as Error).message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasIdentities = data?.linked_identities && data.linked_identities.length > 0;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-display font-bold">Unified Identity Card</h1>
        </div>
        <p className="text-muted-foreground">Your verified identity information across all registered documents.</p>
      </div>

      {data?.uin && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Unique Identification Number</p>
              <p className="text-lg font-mono font-bold text-foreground">{data.uin}</p>
            </div>
          </div>
          {data.user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Name</p>
                <p className="font-medium">{data.user.name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Gender</p>
                <p className="font-medium">{data.user.gender || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Date of Birth</p>
                <p className="font-medium">{data.user.date_of_birth ? new Date(data.user.date_of_birth).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Nationality</p>
                <p className="font-medium">{data.user.nationality || "—"}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {data?.primary_identity?.type && (
        <Card className="p-6 mb-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Primary Identity</p>
              <p className="text-lg font-semibold text-foreground">{data.primary_identity.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Identity Number</p>
              <p className="font-mono font-medium">{data.primary_identity.identity_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Verification Status</p>
              <Badge variant={data.primary_identity.verification_status === "VERIFIED" ? "success" : "default"}>
                {data.primary_identity.verification_status}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Linked Identities
        </h3>
        {!hasIdentities ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <FileText className="w-10 h-10 mb-3 opacity-20" />
            <p>No identities linked to your account.</p>
            <p className="text-xs mt-1">Please contact an administrator to set up your identity records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Document Type</th>
                  <th className="px-4 py-3 font-medium">Identity Number</th>
                  <th className="px-4 py-3 font-medium">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border/50">
                {data.linked_identities.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.identity_number}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.verification_status === "VERIFIED" ? "success" : item.verification_status === "MISMATCH" ? "destructive" : "default"}>
                        {item.verification_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data?.biometric && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            Biometric Registration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${data.biometric.fingerprint_registered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30 border-border/50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.biometric.fingerprint_registered ? "bg-emerald-500/10" : "bg-muted"}`}>
                  <Fingerprint className={`w-4 h-4 ${data.biometric.fingerprint_registered ? "text-emerald-600" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Fingerprint</p>
                  <p className="text-xs text-muted-foreground">{data.biometric.fingerprint_registered ? "Registered" : "Not registered"}</p>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${data.biometric.iris_registered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/30 border-border/50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.biometric.iris_registered ? "bg-emerald-500/10" : "bg-muted"}`}>
                  <Eye className={`w-4 h-4 ${data.biometric.iris_registered ? "text-emerald-600" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Iris</p>
                  <p className="text-xs text-muted-foreground">{data.biometric.iris_registered ? "Registered" : "Not registered"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
