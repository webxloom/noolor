"use client";

import * as React from "react";

type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & {
  ratio?: number | string;
};

function AspectRatio({
  children,
  ratio = "16/9",
  style,
  className,
  ...props
}: AspectRatioProps) {
  const aspect = typeof ratio === "number" ? `${ratio}` : ratio;
  return (
    <div
      style={{ aspectRatio: aspect, ...(style as object) }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export { AspectRatio };
