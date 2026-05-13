"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = { value?: string; setValue: (v: string) => void };
const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  ...props
}: {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const isControlled = controlledValue !== undefined;
  const [value, setValue] = React.useState<string | undefined>(defaultValue);
  const val = isControlled ? controlledValue : value;
  const setVal = (v: string) => {
    if (!isControlled) setValue(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: val, setValue: setVal }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      ref={ref}
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (value) ctx?.setValue(value);
      }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-primary text-background shadow",
        className,
      )}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
