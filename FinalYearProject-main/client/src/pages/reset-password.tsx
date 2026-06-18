import * as React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getOtpEmail } from "@/lib/auth";
import { Input, Button, Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  otp: z.string().min(4, "OTP is required"),
  new_password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Need an uppercase letter")
    .regex(/[a-z]/, "Need a lowercase letter")
    .regex(/\d/, "Need a digit"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const mutation = useResetPassword();
  const email = getOtpEmail();

  React.useEffect(() => {
    if (!email) {
      toast({ description: "Session expired. Please start again." });
      setLocation("/forgot-password");
    }
  }, [email, setLocation, toast]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    if (!email) return;
    mutation.mutate(
      { email, otp: data.otp, new_password: data.new_password },
      {
        onSuccess: () => {
          toast({ title: "Password Reset", description: "You can now sign in with your new password." });
          setLocation("/login");
        },
        onError: (err: any) => {
          toast({
            title: "Reset Failed",
            description: err.message || "Invalid OTP or expired code.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (!email) return null;

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
          onClick={() => setLocation("/forgot-password")}
          className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <Card className="p-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Reset your password</h1>
            <p className="text-sm text-muted-foreground text-balance">
              Enter the code sent to <span className="font-medium text-foreground">{email}</span> and your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Verification code"
              type="text"
              placeholder="6-digit code"
              className="text-center tracking-widest font-mono"
              maxLength={6}
              {...register("otp")}
              error={errors.otp?.message}
            />

            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              {...register("new_password")}
              error={errors.new_password?.message}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              {...register("confirm_password")}
              error={errors.confirm_password?.message}
            />

            <Button type="submit" className="w-full group" isLoading={mutation.isPending}>
              Reset password
              <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
