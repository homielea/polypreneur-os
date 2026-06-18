
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: "lift" | "glow" | "scale" | "none";
  clickEffect?: boolean;
  loadingAnimation?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hoverEffect = "lift", clickEffect = false, loadingAnimation = false, children, onClick, ...props }, ref) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickEffect) {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 150);
      }
      onClick?.(e);
    };

    const getHoverClasses = () => {
      switch (hoverEffect) {
        case "lift":
          return "hover:shadow-lg hover:-translate-y-1";
        case "glow":
          return "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-300";
        case "scale":
          return "hover:scale-[1.02]";
        case "none":
        default:
          return "";
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          // Base animation
          "transition-all duration-200 ease-out",
          // Loading animation
          loadingAnimation && "animate-fade-in",
          // Hover effects
          getHoverClasses(),
          // Click effect
          clickEffect && "cursor-pointer active:scale-[0.98]",
          isClicked && "scale-[0.98]",
          // Focus for accessibility
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
