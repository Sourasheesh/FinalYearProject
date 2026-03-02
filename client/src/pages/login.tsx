import * as React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { useLogin } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { setOtpEmail } from "@/lib/auth";
import { Input, Button } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { z } from "zod";

type LoginForm = z.infer<typeof api.auth.login.input>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(api.auth.login.input)
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setOtpEmail(data.email);
        toast({ title: "OTP Sent", description: "Check your email for the code." });
        setLocation("/verify-otp");
      },
      onError: (err: any) => {
        if (err.is_locked) {
          toast({ 
            title: "Account Locked", 
            description: err.message || "Too many failed attempts. Try again later.", 
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Login Failed", 
            description: err.message || "Invalid credentials.", 
            variant: "destructive" 
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex w-full bg-background font-sans">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to access your secure portal.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Email address"
              type="email" 
              placeholder="name@example.com" 
              {...register("email")}
              error={errors.email?.message}
            />
            
            <Input 
              label="Password"
              type="password" 
              placeholder="••••••••" 
              {...register("password")}
              error={errors.password?.message}
            />

            <Button 
              type="submit" 
              className="w-full mt-2 group" 
              isLoading={loginMutation.isPending}
            >
              Continue securely
              <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-100 overflow-hidden">
        {/* modern clean architecture minimal abstract art */}
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
          alt="Abstract architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent mix-blend-multiply" />
      </div>
    </div>
  );
}
