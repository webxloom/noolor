"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type DropdownMenuAlign = "start" | "center" | "end";

type MenuContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};
const MenuContext = React.createContext<MenuContextValue | null>(null);

function DropdownMenu({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <MenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      {children}
    </MenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(MenuContext);
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any> & {
      ref?: React.Ref<HTMLElement>;
    };
    return React.cloneElement(child, {
      ...(props as any),
      ref: (node: HTMLElement | null) => {
        ctx!.triggerRef.current = node;

        const childRef = child.ref;
        if (typeof childRef === "function") {
          childRef(node);
        } else if (childRef && typeof childRef === "object") {
          childRef.current = node;
        }
      },
      onClick: (e: any) => {
        child.props?.onClick?.(e);
        ctx?.setOpen(!ctx.open);
      },
    } as any);
  }
  return (
    <button
      {...props}
      ref={(node) => {
        if (ctx) {
          ctx.triggerRef.current = node;
        }
      }}
      onClick={(e) => {
        props.onClick?.(e as any);
        ctx?.setOpen(!ctx.open);
      }}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  children,
  className,
  align,
  forceMount = false,
  portal = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: DropdownMenuAlign;
  forceMount?: boolean;
  portal?: boolean;
}) {
  const ctx = React.useContext(MenuContext);
  const [position, setPosition] = React.useState<React.CSSProperties>();

  React.useLayoutEffect(() => {
    if (!ctx?.open) return;

    const updatePosition = () => {
      const triggerRect = ctx.triggerRef.current?.getBoundingClientRect();
      const contentWidth = ctx.contentRef.current?.offsetWidth ?? 0;

      if (!triggerRect) return;

      const gutter = 8;
      let left = triggerRect.left;

      if (align === "center") {
        left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
      } else if (align === "end") {
        left = triggerRect.right - contentWidth;
      }

      left = Math.max(
        gutter,
        Math.min(left, window.innerWidth - contentWidth - gutter),
      );

      setPosition({
        left,
        position: "fixed",
        top: triggerRect.bottom + gutter,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, ctx?.open, ctx?.triggerRef, ctx?.contentRef]);

  if (!ctx || (!ctx.open && !forceMount)) return null;
  const isOpen = ctx.open;
  const content = (
    <div
      ref={ctx.contentRef}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        !isOpen && "pointer-events-none opacity-0",
        className,
      )}
      aria-hidden={!isOpen}
      style={isOpen ? position : { display: "none" }}
      {...props}
    >
      {children}
    </div>
  );
  if (portal && typeof window !== "undefined")
    return createPortal(content, document.body);
  return content;
}

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left",
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = React.forwardRef<
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
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioItem = React.forwardRef<
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
      <Circle className="h-2 w-2" />
    </span>
    {children}
  </button>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuLabel = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  >
    {children}
  </div>
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Lightweight stubs for group/sub/portal APIs to preserve imports
const DropdownMenuGroup = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
);
const DropdownMenuPortal = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
const DropdownMenuSub = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
);
const DropdownMenuSubContent = DropdownMenuContent;
const DropdownMenuSubTrigger = DropdownMenuItem;
const DropdownMenuRadioGroup = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div>{children}</div>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
