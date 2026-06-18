import * as React from "react";
import { useLocation } from "wouter";
import { useIdentities } from "@/hooks/use-identity";
import { IdentityLayout } from "@/components/identity/IdentityLayout";
import { Card, Badge, Input, Button } from "@/components/ui-elements";
import { format } from "date-fns";
import { Search, Plus, Loader2, Shield, FileText } from "lucide-react";

const IDENTITY_TYPE_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar",
  PAN: "PAN",
  PASSPORT: "Passport",
  VOTER_ID: "Voter ID",
  DRIVING_LICENSE: "Driving License",
};

export default function IdentityList() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = useIdentities();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  if (isLoading) {
    return (
      <IdentityLayout>
        <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p>Loading identity records...</p>
        </div>
      </IdentityLayout>
    );
  }

  if (error) {
    return (
      <IdentityLayout>
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-4">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-destructive/80">{(error as Error).message}</p>
        </div>
      </IdentityLayout>
    );
  }

  const identities = data?.data || [];

  const filtered = identities.filter((entry: any) =>
    entry.identity_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getVerificationBadgeVariant = (status: string) => {
    switch (status) {
      case "VERIFIED": return "success";
      case "MISMATCH":
      case "REJECTED": return "destructive";
      default: return "default";
    }
  };

  return (
    <IdentityLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by number or name..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <Button onClick={() => setLocation("/admin/identities/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Identity
        </Button>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <p>{searchTerm ? "No matching identity records found." : "No identity records yet."}</p>
            {!searchTerm && (
              <Button onClick={() => setLocation("/admin/identities/create")} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Create first identity
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Identity Number</th>
                    <th className="px-6 py-4 font-medium">Full Name</th>
                    <th className="px-6 py-4 font-medium">Verification</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border/50">
                  {paginated.map((entry: any) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/admin/identities/${entry.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary/70" />
                          <span className="font-medium">{IDENTITY_TYPE_LABELS[entry.identity_type] || entry.identity_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {entry.identity_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {entry.full_name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getVerificationBadgeVariant(entry.verification_status)}>
                          {entry.verification_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={entry.status === "ACTIVE" ? "success" : "destructive"}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-foreground/60 text-xs whitespace-nowrap">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={(e) => { e.stopPropagation(); setLocation(`/admin/identities/${entry.id}`); }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-9 text-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 text-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </IdentityLayout>
  );
}
