import * as React from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIdentities, useUpdateIdentity } from "@/hooks/use-identity";
import { IdentityLayout } from "@/components/identity/IdentityLayout";
import { Input, Button } from "@/components/ui-elements";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";

const updateSchema = z.object({
  identity_type: z.enum(["AADHAAR", "PAN", "PASSPORT", "VOTER_ID", "DRIVING_LICENSE"]).optional(),
  identity_number: z.string().optional(),
  full_name: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).optional(),
});

type UpdateForm = z.infer<typeof updateSchema>;

export default function IdentityEdit() {
  const [, params] = useRoute("/admin/identities/:id/edit");
  const identityId = params?.id ? parseInt(params.id, 10) : null;
  const [, setLocation] = useLocation();
  const { data: listData, isLoading: listLoading } = useIdentities();
  const updateMutation = useUpdateIdentity();

  const identity = React.useMemo(() => {
    if (!listData?.data || !identityId) return null;
    return listData.data.find((i: any) => i.id === identityId);
  }, [listData, identityId]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateForm>();

  React.useEffect(() => {
    if (identity) {
      reset({
        identity_type: identity.identity_type,
        identity_number: identity.identity_number,
        full_name: identity.full_name,
        father_name: identity.father_name,
        mother_name: identity.mother_name,
        gender: identity.gender,
        date_of_birth: identity.date_of_birth?.split("T")[0],
        nationality: identity.nationality,
        address: identity.address,
        email: identity.email,
        phone: identity.phone,
        status: identity.status,
      });
    }
  }, [identity, reset]);

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
          <h2 className="text-xl font-bold text-destructive mb-2">Identity Not Found</h2>
          <p className="text-destructive/80">The requested identity record does not exist.</p>
        </div>
      </IdentityLayout>
    );
  }

  const onSubmit = (data: UpdateForm) => {
    updateMutation.mutate({ id: identityId, ...data }, {
      onSuccess: () => setLocation("/admin/identities"),
    });
  };

  return (
    <IdentityLayout>
      <button
        onClick={() => setLocation("/admin/identities")}
        className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to identities
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Identity Type</label>
            <select
              {...register("identity_type")}
              className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
            >
              <option value="AADHAAR">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
              <option value="VOTER_ID">Voter ID</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
          </div>

          <Input
            label="Identity Number"
            {...register("identity_number")}
            error={errors.identity_number?.message}
          />

          <Input label="Full Name" {...register("full_name")} error={errors.full_name?.message} />
          <Input label="Father's Name" {...register("father_name")} error={errors.father_name?.message} />
          <Input label="Mother's Name" {...register("mother_name")} error={errors.mother_name?.message} />

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Gender</label>
            <select
              {...register("gender")}
              className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input label="Date of Birth" type="date" {...register("date_of_birth")} error={errors.date_of_birth?.message} />
          <Input label="Nationality" {...register("nationality")} error={errors.nationality?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Phone" {...register("phone")} error={errors.phone?.message} />

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Status</label>
            <select
              {...register("status")}
              className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
            >
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-foreground/80">Address</label>
            <textarea
              {...register("address")}
              className="flex min-h-[80px] w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all resize-y"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={updateMutation.isPending}>
            Update Identity
          </Button>
          <Button type="button" variant="outline" onClick={() => setLocation("/admin/identities")}>
            Cancel
          </Button>
        </div>
      </form>
    </IdentityLayout>
  );
}
