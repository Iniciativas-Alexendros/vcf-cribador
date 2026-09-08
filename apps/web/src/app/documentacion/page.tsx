import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";

export default function DocumentacionPage() {
  return (
    <div className="zed-stack">
      <PageHeader
        title="Documentación"
        description="Referencias del despliegue self-hosted y la paridad CLI ↔ GUI."
      />

      <Callout variant="info" icon="book">
        La CLI sigue siendo la interfaz oficial de automatización. Completions de
        shell no tienen pantalla GUI equivalente.
      </Callout>

      <Card variant="document">
        <ul className="zed-stack" style={{ listStyle: "disc", paddingLeft: "1.25rem" }}>
          <li>
            Matriz de paridad:{" "}
            <code className="zed-mono">docs/gui/functional-parity-matrix.md</code>
          </li>
          <li>
            OpenAPI: <code className="zed-mono">docs/api/openapi.yaml</code>
          </li>
          <li>
            Completions CLI:{" "}
            <code className="zed-mono">zedazo completions bash|zsh|fish</code>
          </li>
          <li>ADR-0015: core compartido + API + web self-hosted.</li>
        </ul>
        <p style={{ marginTop: "1.25rem" }}>
          <Link className="zed-button zed-button--secondary" href="/procesar">
            Ir a Procesar
          </Link>
        </p>
      </Card>
    </div>
  );
}
