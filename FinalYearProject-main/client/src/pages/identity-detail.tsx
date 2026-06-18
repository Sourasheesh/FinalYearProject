import * as React from "react";
import { useLocation, useRoute } from "wouter";
import { useIdentities, useDeleteIdentity } from "@/hooks/use-identity";
import { IdentityLayout } from "@/components/identity/IdentityLayout";
import { Card, Badge, Button } from "@/components/ui-elements";
import { format } from "date-fns";
import { ArrowLeft, Edit3, Trash2, Loader2, Shield, FileText, User, Calendar, MapPin, Phone, Mail, Flag } from "lucide-react";

const IDENTITY_TYPE_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar",
  PAN: "PAN",
  PASSPORT: "Passport",
  VOTER_ID: "Voter ID",
  DRIVING_LICENSE: "Driving License",
};

const getVerificationBadgeVariant = (status: string) => {
  switch (status) {
    case "VERIFIED": return "success";
    case "MISMATCH":
    case "REJECTED": return "destructive";
    default: return "default";
  }
};

export default function IdentityDetail() {
  const [, params] = useRoute("/admin/identities/:id");
  const identityId = params?.id ? parseInt(params.id, 10) : null;
  const [, setLocation] = useLocation();
  const { data: listData, isLoading: listLoading } = useIdentities();
  const deleteMutation = useDeleteIdentity();
  const [showConfirm, setShowConfirm] = React.useState(false);

  const identity = React.useMemo(() => {
    if (!listData?.data || !identityId) return null;
    return listData.data.find((i: any) => i.id === identityId);
  }, [listData, identityId]);

  if (listLoading) {
    return (
      <IdentityLayout>
        <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary/50" />
          <p>Loading identity details...</p>
        </div>
      </IdentityLayout>
    );
  }

  if (!identity) {
    return (
      <IdentityLayout>
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-4">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">Identity Not Found</h2>
          <p className="text-destructive/80">The requested identity record does not exist.</p>
          <Button onClick={() => setLocation("/admin/identities")} variant="outline" className="mt-4">
            Back to list
          </Button>
        </div>
      </IdentityLayout>
    );
  }

  const handleDelete = () => {
    if (!identityId) return;
    deleteMutation.mutate(identityId, {
      onSuccess: () => setLocation("/admin/identities"),
    });
  };

  const verificationColor = identity.verification_status === "VERIFIED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
    identity.verification_status === "MISMATCH" || identity.verification_status === "REJECTED" ? "bg-destructive/10 border-destructive/20 text-destructive" :
    "bg-muted border-border text-muted-foreground";

  return (
    <IdentityLayout>
      <button
        onClick={() => setLocation("/admin/identities")}
        className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to identities
      </button>

      <div className={`${verificationColor} border rounded-2xl p-4 mb-6 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">{identity.verification_status}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={() => setLocation(`/admin/identities/${identityId}/edit`)}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Button>
          {!showConfirm ? (
            <Button
              variant="outline"
              className="h-9 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Confirm?</span>
              <Button
                className="h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                Yes, Delete
              </Button>
              <Button
                variant="ghost"
                className="h-9"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Personal Information
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Full Name</dt>
              <dd className="font-medium text-right">{identity.full_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Father's Name</dt>
              <dd className="font-medium text-right">{identity.father_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mother's Name</dt>
              <dd className="font-medium text-right">{identity.mother_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="font-medium text-right">{identity.gender}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date of Birth</dt>
              <dd className="font-medium text-right">{format(new Date(identity.date_of_birth), "MMM d, yyyy")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Age</dt>
              <dd className="font-medium text-right">{identity.age}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nationality</dt>
              <dd className="font-medium text-right flex items-center gap-1 justify-end">
                <Flag className="w-3 h-3" />
                {identity.nationality}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Document Details
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Document Type</dt>
              <dd className="font-medium text-right">
                <Badge variant="default">{IDENTITY_TYPE_LABELS[identity.identity_type] || identity.identity_type}</Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Identity Number</dt>
              <dd className="font-mono text-xs text-right">{identity.identity_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Verification Status</dt>
              <dd><Badge variant={getVerificationBadgeVariant(identity.verification_status)}>{identity.verification_status}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Account Status</dt>
              <dd><Badge variant={identity.status === "ACTIVE" ? "success" : "destructive"}>{identity.status}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="text-right flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" />
                {format(new Date(identity.created_at), "MMM d, yyyy • HH:mm")}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Contact & Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground mb-1">Email</dt>
              <dd className="font-medium flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {identity.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-1">Phone</dt>
              <dd className="font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {identity.phone}
              </dd>
            </div>
            <div className="md:col-span-3">
              <dt className="text-muted-foreground mb-1">Address</dt>
              <dd className="font-medium">{identity.address}</dd>
            </div>
          </div>
        </Card>
      </div>
    </IdentityLayout>
  );
}
