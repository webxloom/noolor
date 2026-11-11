"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const TooltipProvider = ({
  children,
}: {
  children?: React.ReactNode;
  delayDuration?: number;
}) => <>{children}</>;

const TooltipContext = React.createContext<{
  show: boolean;
  setShow: (v: boolean) => void;
  label?: React.ReactNode;
  anchorRect?: DOMRect | null;
  setAnchorRect: (rect: DOMRect | null) => void;
} | null>(null);

function Tooltip({ children }: { children?: React.ReactNode }) {
  const [show, setShow] = React.useState(false);
  const [label, setLabel] = React.useState<React.ReactNode | undefined>();
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);

  return (
    <TooltipContext.Provider
      value={{ show, setShow, label, anchorRect, setAnchorRect }}
    >
      {children}
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  children,
  asChild: _asChild,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const ctx = React.useContext(TooltipContext);
  const ref = React.useRef<HTMLElement | null>(null);

  const onEnter = () => {
    if (!ref.current || !ctx) return;
    ctx.setShow(true);
    ctx.setAnchorRect(ref.current.getBoundingClientRect());
  };
  const onLeave = () => {
    ctx?.setShow(false);
    ctx?.setAnchorRect(null);
  };

  if (React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement,
      {
        ref: (node: any) => (ref.current = node),
        onMouseEnter: (e: any) => {
          (children as any).props?.onMouseEnter?.(e);
          onEnter();
        },
        onMouseLeave: (e: any) => {
          (children as any).props?.onMouseLeave?.(e);
          onLeave();
        },
        ...props,
      } as any,
    );
  }

  return (
    <span
      ref={ref as any}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...props}
    >
      {children}
    </span>
  );
}

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: string;
    align?: string;
  }
>(({ className, children, side: _side, align: _align, ...props }, ref) => {
  const ctx = React.useContext(TooltipContext);
  if (!ctx || !ctx.show) return null;
  const content = (
    <div
      ref={ref}
      className={cn(
        "z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
