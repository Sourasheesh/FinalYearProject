import * as React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateIdentity } from "@/hooks/use-identity";
import { IdentityLayout } from "@/components/identity/IdentityLayout";
import { Input, Button } from "@/components/ui-elements";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const createSchema = z.object({
  user: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().positive("User ID is required")
  ),
  identity_type: z.enum(["AADHAAR", "PAN", "PASSPORT", "VOTER_ID", "DRIVING_LICENSE"]),
  identity_number: z.string().min(1, "Identity number is required"),
  full_name: z.string().min(1, "Full name is required"),
  father_name: z.string().min(1, "Father's name is required"),
  mother_name: z.string().min(1, "Mother's name is required"),
  gender: z.string().min(1, "Gender is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]).default("ACTIVE"),
});

type CreateForm = z.infer<typeof createSchema>;

export default function IdentityCreate() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateIdentity();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { nationality: "Indian", status: "ACTIVE" },
  });

  const onSubmit = (data: CreateForm) => {
    createMutation.mutate(data, {
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
          <Input
            label="User ID"
            type="number"
            placeholder="Enter user ID"
            {...register("user")}
            error={errors.user?.message}
          />

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Identity Type</label>
            <select
              {...register("identity_type")}
              className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
            >
              <option value="">Select type...</option>
              <option value="AADHAAR">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="PASSPORT">Passport</option>
              <option value="VOTER_ID">Voter ID</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
            {errors.identity_type && <span className="text-xs text-destructive mt-1">{errors.identity_type.message}</span>}
          </div>

          <Input
            label="Identity Number"
            placeholder="e.g. XXXX-XXXX-XXXX"
            {...register("identity_number")}
            error={errors.identity_number?.message}
          />

          <Input
            label="Full Name"
            placeholder="Full name as on document"
            {...register("full_name")}
            error={errors.full_name?.message}
          />

          <Input
            label="Father's Name"
            placeholder="Father's name"
            {...register("father_name")}
            error={errors.father_name?.message}
          />

          <Input
            label="Mother's Name"
            placeholder="Mother's name"
            {...register("mother_name")}
            error={errors.mother_name?.message}
          />

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Gender</label>
            <select
              {...register("gender")}
              className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
            >
              <option value="">Select gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span className="text-xs text-destructive mt-1">{errors.gender.message}</span>}
          </div>

          <Input
            label="Date of Birth"
            type="date"
            {...register("date_of_birth")}
            error={errors.date_of_birth?.message}
          />

          <Input
            label="Nationality"
            placeholder="Indian"
            {...register("nationality")}
            error={errors.nationality?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Phone"
            placeholder="+91-XXXXXXXXXX"
            {...register("phone")}
            error={errors.phone?.message}
          />

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
            {errors.status && <span className="text-xs text-destructive mt-1">{errors.status.message}</span>}
          </div>

          <div className="flex flex-col space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-foreground/80">Address</label>
            <textarea
              {...register("address")}
              placeholder="Full address"
              className="flex min-h-[80px] w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all resize-y"
            />
            {errors.address && <span className="text-xs text-destructive mt-1">{errors.address.message}</span>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Identity
          </Button>
          <Button type="button" variant="outline" onClick={() => setLocation("/admin/identities")}>
            Cancel
          </Button>
        </div>
      </form>
    </IdentityLayout>
  );
}
