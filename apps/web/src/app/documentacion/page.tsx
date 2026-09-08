export default function DocumentacionPage() {
  return (
    <div>
      <h1>Documentación</h1>
      <div className="panel">
        <ul>
          <li>
            Matriz de paridad:{" "}
            <code>docs/gui/functional-parity-matrix.md</code>
          </li>
          <li>
            OpenAPI: <code>docs/api/openapi.yaml</code>
          </li>
          <li>
            Completions CLI:{" "}
            <code className="mono">zedazo completions bash|zsh|fish</code> —
            sin pantalla GUI equivalente.
          </li>
          <li>ADR-0015: core compartido + API + web self-hosted.</li>
        </ul>
      </div>
    </div>
  );
}
