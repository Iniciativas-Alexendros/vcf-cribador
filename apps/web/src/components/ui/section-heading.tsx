import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ title, description, action }: Props) {
  return (
    <div
      className="zed-row"
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "var(--zed-space-4)",
      }}
    >
      <div>
        <h2 className="zed-title-section">{title}</h2>
        {description ? (
          <p className="zed-muted" style={{ margin: 0 }}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
