type Props = {
  href: string;
  label: string;
  description?: string;
  meta?: string;
};

export function ArtifactDownload({ href, label, description, meta }: Props) {
  return (
    <div
      className="zed-row"
      style={{
        justifyContent: "space-between",
        padding: "0.75rem 0",
        borderBottom: "1px solid var(--zed-border-subtle)",
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {description ? (
          <p
            className="zed-muted"
            style={{ margin: "0.2rem 0 0", fontSize: "0.875rem" }}
          >
            {description}
          </p>
        ) : null}
        {meta ? (
          <p className="zed-mono zed-muted" style={{ margin: "0.2rem 0 0" }}>
            {meta}
          </p>
        ) : null}
      </div>
      <a className="zed-button zed-button--secondary" href={href}>
        Descargar
      </a>
    </div>
  );
}
