type Props = {
  action?: string;
  rule?: string;
  reason?: string;
  cols?: string[];
};

export function AuditEvent({ action, rule, reason, cols }: Props) {
  if (cols && cols.length > 0) {
    return (
      <tr>
        {cols.map((c, i) => (
          <td key={i} className="zed-mono" style={{ overflowWrap: "anywhere" }}>
            {c}
          </td>
        ))}
      </tr>
    );
  }
  return (
    <article
      style={{
        padding: "0.75rem 0",
        borderBottom: "1px solid var(--zed-border-subtle)",
      }}
    >
      <div style={{ fontWeight: 600 }}>{action || "Evento"}</div>
      {rule ? <p className="zed-mono" style={{ margin: "0.2rem 0" }}>{rule}</p> : null}
      {reason ? <AuditReason text={reason} /> : null}
    </article>
  );
}

function AuditReason({ text }: { text: string }) {
  return <p className="zed-muted" style={{ margin: 0 }}>{text}</p>;
}
