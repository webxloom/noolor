import * as React from "react";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, checked, defaultChecked, onChange, ...props }, ref) => {
  return (
    <label className={cn("inline-flex items-center cursor-pointer", className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        className="sr-only"
        {...props}
      />
      <span
        className={cn(
          "relative inline-block h-5 w-9 rounded-full transition-colors bg-input",
          (checked || (defaultChecked as any)) && "bg-primary",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-0 m-[2px] h-4 w-4 rounded-full bg-background shadow transition-transform",
            (checked || (defaultChecked as any)) && "translate-x-4",
          )}
        />
      </span>
    </label>
  );
});
Switch.displayName = "Switch";

export { Switch };
