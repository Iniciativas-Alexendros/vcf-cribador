type Props = {
  hash?: string | null;
};

export function RulesHash({ hash }: Props) {
  if (!hash) {
    return (
      <p className="zed-muted">
        El hash de reglas aparecerá cuando la ejecución o la validación lo
        expongan.
      </p>
    );
  }
  return (
    <p>
      Hash de reglas:{" "}
      <code className="zed-mono" title={hash}>
        {hash}
      </code>
    </p>
  );
}
