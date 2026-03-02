import * as React from "react";
import { Link, useLocation } from "wouter";
import { clearAuthSession, getUserRole } from "@/lib/auth";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const role = getUserRole();

  const handleLogout = () => {
    clearAuthSession();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">SecureApp</span>
          </div>

          <div className="flex items-center gap-4">
            {role && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium capitalize text-muted-foreground">{role} Portal</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
