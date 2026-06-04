"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn, CloseIcon } from "@/lib/utils";

type DialogProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function Dialog({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: DialogProps) {
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
    <div {...props}>
      <DialogContext.Provider value={{ open: valueOpen, setOpen }}>
        {children}
      </DialogContext.Provider>
    </div>
  );
}

function DialogTrigger({
  children,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any, any>;
    return React.cloneElement(child, {
      ...(props as any),
      onClick: (e: any) => {
        child.props?.onClick?.(e);
        ctx?.setOpen(true);
      },
    } as any);
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e as any);
        ctx?.setOpen(true);
      }}
    >
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx || !ctx.open) return null;

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Track open dialogs globally to support nested dialogs
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__dialogOpenCount = (window.__dialogOpenCount || 0) + 1;

    const body = document.body;
    const html = document.documentElement;

    // Save original overflow styles once
    if (!body.dataset.originalOverflow) {
      body.dataset.originalOverflow = body.style.overflow || "";
    }
    if (!html.dataset.originalOverflow) {
      html.dataset.originalOverflow = html.style.overflow || "";
    }

    // Prevent background scrolling
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__dialogOpenCount = (window.__dialogOpenCount || 1) - 1;
      // Only restore when last dialog is closed
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.__dialogOpenCount <= 0) {
        if (body.dataset.originalOverflow !== undefined) {
          body.style.overflow = body.dataset.originalOverflow;
          delete body.dataset.originalOverflow;
        } else {
          body.style.overflow = "";
        }
        if (html.dataset.originalOverflow !== undefined) {
          html.style.overflow = html.dataset.originalOverflow;
          delete html.dataset.originalOverflow;
        } else {
          html.style.overflow = "";
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete window.__dialogOpenCount;
      }
    };
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          // make the dialog content constrained and scrollable when tall
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg max-h-[80vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg overflow-auto",
          className,
        )}
        {...props}
      >
        {children}
        <button
          aria-label="Close"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => ctx.setOpen(false)}
        >
          <CloseIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogClose = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const ctx = React.useContext(DialogContext);
  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        ctx?.setOpen(false);
      }}
    >
      {children}
    </button>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
