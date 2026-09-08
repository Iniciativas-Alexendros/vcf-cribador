import type { HTMLAttributes, ReactNode } from "react";

type Variant = "document" | "action" | "metric" | "outlined" | "interactive";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Card({
  variant = "document",
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <div
      className={`zed-card zed-card--${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
