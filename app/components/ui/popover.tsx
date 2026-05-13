"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const valueOpen = isControlled ? !!open : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <PopoverContext.Provider value={{ open: valueOpen, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({
  children,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(PopoverContext);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any, any>;
    return React.cloneElement(child, {
      ...(props as any),
      onClick: (e: any) => {
        child.props?.onClick?.(e);
        ctx?.setOpen(!ctx.open);
      },
    } as any);
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e as any);
        ctx?.setOpen(!ctx.open);
      }}
    >
      {children}
    </button>
  );
}

function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  portal = true,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right" | string;
  align?: "start" | "center" | "end" | string;
  portal?: boolean;
}) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx || !ctx.open) return null;

  const sideClass: Record<string, string> = {
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const alignClass: Record<string, string> = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const content = (
    <div
      role="dialog"
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        sideClass[side] || sideClass.bottom,
        (alignClass as any)[align] || "left-1/2 -translate-x-1/2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );

  if (portal && typeof window !== "undefined")
    return createPortal(content, document.body);
  return content;
}

export { Popover, PopoverTrigger, PopoverContent };
