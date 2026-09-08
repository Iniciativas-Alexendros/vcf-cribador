type Props = { text: string };

export function AuditReason({ text }: Props) {
  return <p className="zed-muted" style={{ margin: 0 }}>{text}</p>;
}
