import * as React from "react";

import { cn } from "@/lib/utils";

type RadioGroupContextValue = {
  name?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  setValue: (nextValue: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null,
);

type RadioGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  defaultValue?: string;
  name?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  value?: string;
};

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { className, defaultValue, name, onValueChange, required, value, ...props },
    ref,
  ) => {
    const generatedName = React.useId();
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = isControlled ? value : internalValue;

    const setValue = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange],
    );

    return (
      <RadioGroupContext.Provider
        value={{
          disabled: props["aria-disabled"] === true || undefined,
          name: name ?? generatedName,
          required,
          setValue,
          value: currentValue,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-2", className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

type RadioGroupItemProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "name" | "type"
> & {
  value: string;
};

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, disabled, onChange, required, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);

    if (!context) {
      throw new Error("RadioGroupItem must be used within <RadioGroup>");
    }

    const isChecked = context.value === value;
    const isDisabled = context.disabled || disabled;

    return (
      <input
        ref={ref}
        type="radio"
        name={context.name}
        value={value}
        checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={isDisabled}
        required={required ?? context.required}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onChange={(event) => {
          if (event.target.checked) {
            context.setValue(value);
          }

          onChange?.(event);
        }}
        {...props}
      />
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
