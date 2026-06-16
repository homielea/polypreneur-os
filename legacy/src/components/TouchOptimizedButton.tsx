
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TouchOptimizedButtonProps extends ButtonProps {
  touchFeedback?: boolean;
}

export const TouchOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  TouchOptimizedButtonProps
>(({ className, touchFeedback = true, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        // Enhanced touch targets
        "min-h-[44px] min-w-[44px]",
        // Touch feedback
        touchFeedback && "active:scale-95 transition-transform duration-75",
        // Better focus for keyboard navigation
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Improved hover states
        "hover:scale-[1.02] transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
});

TouchOptimizedButton.displayName = "TouchOptimizedButton";
