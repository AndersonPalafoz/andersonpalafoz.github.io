import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";
    const variants = {
      default: "bg-primary text-primary-foreground shadow-sm shadow-red-600/15 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md hover:shadow-red-600/20",
      outline: "border border-border bg-card text-card-foreground shadow-sm hover:-translate-y-0.5 hover:border-red-200 hover:bg-accent hover:text-accent-foreground",
      ghost: "text-foreground hover:bg-muted hover:text-primary",
    };
    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return <Comp className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

export { Button };
