import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
}

export const GradientIcon = ({ icon: Icon, className, size = 24 }: GradientIconProps) => {
  return (
    <span className={cn("inline-flex", className)}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBC00" />
            <stop offset="40%" stopColor="#FDBC00" />
            <stop offset="80%" stopColor="#FF8B00" />
            <stop offset="100%" stopColor="#EC2700" />
          </linearGradient>
        </defs>
      </svg>
      <Icon
        size={size}
        style={{ stroke: "url(#icon-gradient)" }}
        className="[&>*]:stroke-[url(#icon-gradient)]"
      />
    </span>
  );
};

// Global SVG gradient definition - add this once in your app
export const GradientDefs = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <defs>
      <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDBC00" />
        <stop offset="40%" stopColor="#FDBC00" />
        <stop offset="80%" stopColor="#FF8B00" />
        <stop offset="100%" stopColor="#EC2700" />
      </linearGradient>
    </defs>
  </svg>
);

export default GradientIcon;
