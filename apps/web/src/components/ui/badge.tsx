import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "technical";

type Props = {
  tone?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function Badge({
  tone = "neutral",
  children,
  icon,
  className = "",
}: Props) {
  return (
    <span className={`zed-badge zed-badge--${tone} ${className}`.trim()}>
      {icon}
      {children}
    </span>
  );
}
