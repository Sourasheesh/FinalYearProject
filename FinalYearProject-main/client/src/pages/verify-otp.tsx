import * as React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { useVerifyOtp } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getOtpEmail, setAuthSession } from "@/lib/auth";
import { Input, Button, Card } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft } from "lucide-react";
import { z } from "zod";

type VerifyOtpForm = { otp: string };

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const verifyMutation = useVerifyOtp();
  const email = getOtpEmail();

  // Redirect if no email in session
  React.useEffect(() => {
    if (!email) {
      toast({ description: "Session expired. Please log in again." });
      setLocation("/login");
    }
  }, [email, setLocation, toast]);

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyOtpForm>({
    resolver: zodResolver(z.object({ otp: z.string().min(4, "OTP is required") }))
  });

  const onSubmit = (data: VerifyOtpForm) => {
    if (!email) return;
    
    verifyMutation.mutate({ email, otp: data.otp }, {
      onSuccess: (res) => {
        setAuthSession(res.access, res.refresh, res.role);
        toast({ title: "Verification Successful", description: "Welcome back!" });
        
        if (res.role === 'admin') {
          setLocation("/admin-dashboard");
        } else {
          setLocation("/user-dashboard");
        }
      },
      onError: (err: any) => {
        toast({ 
          title: "Verification Failed", 
          description: err.message || "Invalid OTP code.", 
          variant: "destructive" 
        });
      }
    });
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
          onClick={() => setLocation("/login")}
          className="mb-6 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
        </button>

        <Card className="p-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Two-Factor Authentication</h1>
            <p className="text-sm text-muted-foreground text-balance">
              We've sent a secure code to <span className="font-medium text-foreground">{email}</span>. Please enter it below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input 
              type="text" 
              placeholder="Enter 6-digit code" 
              className="text-center text-xl tracking-widest font-mono"
              maxLength={6}
              {...register("otp")}
              error={errors.otp?.message}
            />

            <Button 
              type="submit" 
              className="w-full" 
              isLoading={verifyMutation.isPending}
            >
              Verify & Continue
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
