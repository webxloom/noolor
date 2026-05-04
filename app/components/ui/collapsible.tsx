"use client";

import * as React from "react";

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null,
);

function Collapsible({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const open = isControlled ? !!controlledOpen : internalOpen;

  const toggle = React.useCallback(() => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({
  children,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(CollapsibleContext);
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...(props as any),
      onClick: (e: any) => {
        child.props?.onClick?.(e);
        ctx?.toggle();
      },
    } as any);
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e as any);
        ctx?.toggle();
      }}
    >
      {children}
    </button>
  );
}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return null;
  if (!ctx.open) return null;
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
