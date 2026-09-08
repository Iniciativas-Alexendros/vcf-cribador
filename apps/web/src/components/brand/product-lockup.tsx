import Link from "next/link";
import { ZedazoMark } from "./zedazo-mark";
import { ZedazoWordmark } from "./zedazo-wordmark";

type Props = {
  href?: string;
  subtitle?: string;
  size?: 16 | 20 | 24 | 32 | 48;
  className?: string;
};

export function ProductLockup({
  href = "/",
  subtitle = "Procesamiento VCF local",
  size = 24,
  className,
}: Props) {
  const inner = (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.65rem" }}>
        <ZedazoMark size={size} />
        <ZedazoWordmark />
      </span>
      {subtitle ? (
        <span
          style={{
            display: "block",
            marginTop: "0.15rem",
            fontSize: "0.875rem",
            fontWeight: 400,
            color: "var(--zed-fg-muted)",
          }}
        >
          {subtitle}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={{
          color: "var(--zed-fg-strong)",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "1.15rem",
        }}
      >
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
