import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Beautiful, custom tailored UI components matching the clean minimal aesthetic

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && <label className="text-sm font-medium text-foreground/80">{label}</label>}
        <input
          ref={ref}
          className={`
            flex h-12 w-full rounded-xl bg-muted/50 px-4 py-2 text-sm text-foreground
            border border-transparent transition-all duration-200
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-muted-foreground
            focus-visible:outline-none focus-visible:bg-background focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/20" : ""}
            ${className || ""}
          `}
          {...props}
        />
        {error && <span className="text-xs text-destructive mt-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', isLoading?: boolean }>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border-2 border-border bg-transparent hover:bg-muted text-foreground",
      ghost: "bg-transparent hover:bg-muted text-foreground"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20
          disabled:pointer-events-none disabled:opacity-50
          h-12 px-6 py-2 active:scale-[0.98]
          ${variants[variant]}
          ${className || ""}
        `}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-3xl border border-border/50 bg-card text-card-foreground shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ${className || ""}`}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'success' | 'destructive' | 'default' }) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    default: "bg-muted text-muted-foreground border border-border"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};
