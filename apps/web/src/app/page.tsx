import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1>Zedazo</h1>
      <p className="muted">
        Procesa agendas VCF (Proton, Google, Apple) en tu máquina: cribado,
        normalización, clasificación y deduplicación. Sin telemetría remota por
        defecto. Los datos son personales — retención efímera configurable.
      </p>
      <div className="panel">
        <p>
          Política actual: modo local single-user, almacenamiento efímero bajo
          el directorio de datos del API, sin cuentas ni colaboración.
        </p>
        <Link className="btn" href="/procesar">
          Procesar archivo VCF
        </Link>
      </div>
      <p className="muted" style={{ marginTop: "2rem" }}>
        Autocompletado de shell (`zedazo completions`) sigue siendo solo CLI —
        ver Documentación.
      </p>
    </div>
  );
}
