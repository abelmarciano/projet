import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium elegant button (recommended)
        premium: "btn-premium-elegant font-semibold premium-solid-text",
        // Gradient background button with white text (for light backgrounds)
        gradient: "rounded-full text-white font-semibold bg-gradient-to-r from-[#FDBC00] via-[#FF8B00] to-[#EC2700] hover:shadow-[0_0_30px_rgba(255,139,0,0.4)] hover:scale-[1.02] active:scale-[0.98]",
        // Dark button with gradient text
        "gradient-text": "rounded-full bg-card/80 border border-border/50 font-semibold hover:border-primary/30 hover:bg-card transition-all [&>span]:bg-gradient-primary [&>span]:bg-clip-text [&>span]:text-transparent",
        // Animated rotating gradient border
        "animated-border": "btn-animated-border font-semibold [&>span]:bg-gradient-primary [&>span]:bg-clip-text [&>span]:text-transparent hover:scale-[1.02] active:scale-[0.98] transition-transform",
        // Glow effect button
        glow: "rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(253,188,0,0.4)] hover:shadow-[0_0_35px_rgba(255,139,0,0.6)] hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
