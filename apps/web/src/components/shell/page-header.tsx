import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, description, actions, eyebrow }: Props) {
  return (
    <header
      className="zed-row"
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "var(--zed-space-6)",
        gap: "var(--zed-space-4)",
      }}
    >
      <div>
        {eyebrow ? (
          <p
            className="zed-label"
            style={{ margin: "0 0 0.35rem", color: "var(--zed-accent-active)" }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1 className="zed-title-page">{title}</h1>
        {description ? (
          <p className="zed-muted" style={{ margin: 0, maxWidth: "42rem" }}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="zed-row">{actions}</div> : null}
    </header>
  );
}
