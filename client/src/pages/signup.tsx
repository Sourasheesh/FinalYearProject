import * as React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { useSignup } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input, Button } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus } from "lucide-react";
import { z } from "zod";

type SignupForm = z.infer<typeof api.auth.signup.input>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(api.auth.signup.input),
    defaultValues: { role: 'user' }
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data, {
      onSuccess: () => {
        toast({ 
          title: "Account Created", 
          description: "Please check your email to verify your account." 
        });
        setLocation("/login");
      },
      onError: (err: any) => {
        toast({ 
          title: "Signup Failed", 
          description: err.message || "Failed to create account.", 
          variant: "destructive" 
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-row-reverse w-full bg-background font-sans">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-8 border border-border/50">
            <UserPlus className="w-6 h-6 text-foreground" />
          </div>
          
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-2">Create account</h1>
          <p className="text-muted-foreground mb-8">Join the secure portal and manage your identity.</p>

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
              placeholder="Create a strong password" 
              {...register("password")}
              error={errors.password?.message}
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Select Role</label>
              <select 
                {...register("role")}
                className="flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground border border-transparent focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10 transition-all cursor-pointer"
              >
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
              {errors.role && <span className="text-xs text-destructive">{errors.role.message}</span>}
            </div>

            <Button 
              type="submit" 
              className="w-full mt-4" 
              isLoading={signupMutation.isPending}
            >
              Sign up securely
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-100 overflow-hidden">
        {/* soft gradient minimal abstract art texture */}
        <img 
          src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000&auto=format&fit=crop" 
          alt="Abstract mesh gradient" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale-[0.3]"
        />
        <div className="absolute inset-0 bg-primary mix-blend-overlay opacity-30" />
      </div>
    </div>
  );
}
