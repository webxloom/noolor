"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value?: string;
  setValue: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext);

  if (!context) {
    throw new Error(`${component} must be used within <Select>`);
  }

  return context;
}

function Select({
  children,
  value,
  defaultValue,
  onValueChange,
}: {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const currentValue = value ?? internalValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
      setOpen(false);
    },
    [onValueChange, value],
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }

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
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value: currentValue,
        setValue,
        triggerRef,
        contentRef,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}

function SelectValue({
  placeholder,
  children,
}: {
  placeholder?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { value } = useSelectContext("SelectValue");

  if (children) {
    return <>{children}</>;
  }

  return <>{value ?? placeholder}</>;
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useSelectContext("SelectTrigger");

  return (
    <button
      ref={(node) => {
        triggerRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        setOpen((current) => !current);
      }}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-expanded={open}
      {...props}
    >
      <span className="line-clamp-1">{children}</span>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, contentRef } = useSelectContext("SelectContent");

  if (!open) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        contentRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        "absolute top-[calc(100%+0.25rem)] z-50 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

function SelectLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
}

const SelectItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, children, value, onClick, ...props }, ref) => {
  const { value: selectedValue, setValue } = useSelectContext("SelectItem");

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full items-center rounded-sm py-1.5 pl-2 pr-8 text-sm text-left outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        setValue(value);
      }}
      {...props}
    >
      <span className="line-clamp-1">{children}</span>
      {selectedValue === value ? (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      ) : null}
    </button>
  );
});
SelectItem.displayName = "SelectItem";

function SelectSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  );
}

function SelectScrollUpButton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-1", className)}>
      <ChevronUp className="h-4 w-4" />
    </div>
  );
}

function SelectScrollDownButton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-1", className)}>
      <ChevronDown className="h-4 w-4" />
    </div>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
