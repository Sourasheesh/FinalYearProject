import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import { ShieldCheck } from "lucide-react";

export function IdentityLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-display font-bold">Identity Management</h1>
        </div>
        <p className="text-muted-foreground">View and manage identity records across all document types.</p>
      </div>
      <div className="rounded-3xl border border-border/50 bg-card text-card-foreground shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-6">
        {children}
      </div>
    </DashboardLayout>
  );
}
