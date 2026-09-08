type Props = {
  rule?: string | null;
};

export function FieldProvenance({ rule }: Props) {
  if (!rule) {
    return (
      <p className="zed-muted">
        No hay regla de cribado asociada en los datos disponibles.
      </p>
    );
  }
  return (
    <p>
      Decisión asociada a la regla{" "}
      <code className="zed-mono">{rule}</code>. La proveniencia detallada de cada
      campo depende del artefacto de auditoría de la ejecución.
    </p>
  );
}
