import * as React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { setOtpEmail } from "@/lib/auth";
import { Input, Button, Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const mutation = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        setOtpEmail(data.email);
        toast({ title: "OTP Sent", description: "Check your email for the reset code." });
        setLocation("/reset-password");
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message || "Something went wrong.",
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
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Forgot password?</h1>
            <p className="text-sm text-muted-foreground text-balance">
              Enter your email and we'll send you a code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <Button type="submit" className="w-full group" isLoading={mutation.isPending}>
              Send reset code
              <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
