import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  openValues: string[];
  toggle: (value: string) => void;
  type: AccordionType;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null,
);

const Accordion = ({
  children,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (v: string | string[]) => void;
}) => {
  const isControlled = value !== undefined;

  const [internal, setInternal] = React.useState<string[]>(() => {
    if (defaultValue == null) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const openValues = React.useMemo(() => {
    if (isControlled)
      return Array.isArray(value) ? value : value ? [value] : [];
    return internal;
  }, [isControlled, value, internal]);

  const toggle = React.useCallback(
    (val: string) => {
      let next: string[] = [];
      if (type === "single") {
        next = openValues[0] === val ? [] : [val];
      } else {
        if (openValues.includes(val))
          next = openValues.filter((v) => v !== val);
        else next = [...openValues, val];
      }

      if (!isControlled) setInternal(next);
      onValueChange?.(type === "single" ? (next[0] ?? "") : next);
    },
    [openValues, type, isControlled, onValueChange],
  );

  return (
    <div className={cn("w-full", className)} {...props}>
      <AccordionContext.Provider value={{ openValues, toggle, type }}>
        {children}
      </AccordionContext.Provider>
    </div>
  );
};

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="accordion-item"
    data-value={value}
    className={cn("border-b", className)}
    {...props}
  >
    {children}
  </div>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(AccordionContext);
  const isOpen = !!(ctx && value && ctx.openValues.includes(value));

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (value && ctx) ctx.toggle(value);
    if (props.onClick)
      (props.onClick as React.MouseEventHandler<HTMLButtonElement>)(e);
  };

  return (
    <div className="flex">
      <button
        ref={ref}
        aria-expanded={isOpen}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </button>
    </div>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(AccordionContext);
  const isOpen = !!(ctx && value && ctx.openValues.includes(value));

  return (
    <div
      ref={ref}
      role="region"
      data-state={isOpen ? "open" : "closed"}
      className={cn("overflow-hidden text-sm", className)}
      {...props}
    >
      <div className={cn("pb-4 pt-0", !isOpen && "hidden")}>{children}</div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
