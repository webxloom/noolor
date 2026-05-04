import * as React from "react";

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type Size = "default" | "sm" | "lg" | "icon";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground border border-primary-border",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
  outline:
    "border [border-color:var(--button-outline)] shadow-xs active:shadow-none",
  secondary:
    "border bg-secondary text-secondary-foreground border border-secondary-border",
  ghost: "border border-transparent",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<Size, string> = {
  default: "min-h-9 px-4 py-2",
  sm: "min-h-8 rounded-md px-3 text-xs",
  lg: "min-h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = buttonVariants({ variant, size, className });

    if (asChild && React.isValidElement(children)) {
      // Merge classes with the child element's existing className and pass other props
      const child = children as React.ReactElement<any, any>;
      const childClass = (child.props && (child.props as any).className) || "";
      return React.cloneElement(child, {
        ...(props as any),
        className: [childClass, classes].filter(Boolean).join(" "),
        ref,
      } as any);
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
