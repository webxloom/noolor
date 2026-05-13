"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type ContextMenuState = { open: boolean; x: number; y: number };

const ContextMenuContext = React.createContext<{
  state: ContextMenuState;
  setState: React.Dispatch<React.SetStateAction<ContextMenuState>>;
} | null>(null);

function ContextMenu({ children }: { children?: React.ReactNode }) {
  const [state, setState] = React.useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
  });
  return (
    <ContextMenuContext.Provider value={{ state, setState }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

function ContextMenuTrigger({
  children,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const ctx = React.useContext(ContextMenuContext);
  if (!ctx) return <>{children}</>;

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    ctx.setState({ open: true, x: e.clientX, y: e.clientY });
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...(props as any),
      onContextMenu: handleContext,
    } as any);
  }

  return (
    <div {...props} onContextMenu={handleContext}>
      {children}
    </div>
  );
}

function ContextMenuContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(ContextMenuContext);
  if (!ctx || !ctx.state.open) return null;
  const content = (
    <div
      style={{ position: "fixed", left: ctx.state.x, top: ctx.state.y }}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}

const ContextMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-left",
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuCheckboxItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-left",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked ? <Check className="h-4 w-4" /> : null}
    </span>
    {children}
  </button>
));
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

const ContextMenuRadioItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-left",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Circle className="h-4 w-4" />
    </span>
    {children}
  </button>
));
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

const ContextMenuLabel = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
);
ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest text-muted-foreground",
      className,
    )}
    {...props}
  />
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

// Stubs for API compatibility
const ContextMenuGroup = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
);
const ContextMenuPortal = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
const ContextMenuSub = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
);
const ContextMenuSubContent = ContextMenuContent;
const ContextMenuSubTrigger = ContextMenuItem;
const ContextMenuRadioGroup = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div>{children}</div>;

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
