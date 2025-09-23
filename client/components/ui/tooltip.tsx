import * as React from "react";
import { cn } from "@/lib/utils";

// Minimal no-dependency Tooltip shim to keep builds deterministic.
// It renders children as-is and shows content inline when used.

type TooltipProviderProps = {
  children?: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
  [key: string]: any;
};
const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => (
  <>{children}</>
);

type TooltipProps = { children?: React.ReactNode };
const Tooltip: React.FC<TooltipProps> = ({ children }) => <>{children}</>;

type TooltipTriggerProps = {
  children?: React.ReactNode;
  asChild?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>;
const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ children, asChild = false, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        ...props,
      });
    }

    return (
      <span ref={ref} {...props}>
        {children}
      </span>
    );
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  alignOffset?: number;
  hidden?: boolean;
};
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset: _sideOffset, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
