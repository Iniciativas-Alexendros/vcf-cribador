"use client";

import { useState } from "react";
import { validateRules } from "@/lib/api";

const EXAMPLE = `[zedazo]
replace = false
prefijo_pais = "+34"

[clasificacion]
replace = false
`;

export default function ReglasPage() {
  const [toml, setToml] = useState(EXAMPLE);
  const [result, setResult] = useState<string>("");

  return (
    <div>
      <h1>Reglas</h1>
      <p className="muted">
        Modos: integradas (al crear job), cargar/editar TOML aquí.{" "}
        <code>replace=false</code> hace append a defaults;{" "}
        <code>replace=true</code> sustituye. Ninguna edición se aplica hasta
        crear una ejecución nueva.
      </p>
      <div className="panel">
        <textarea
          className="mono"
          rows={16}
          value={toml}
          onChange={(e) => setToml(e.target.value)}
        />
        <button
          className="btn"
          style={{ marginTop: "0.75rem" }}
          onClick={async () => {
            const r = await validateRules(toml);
            setResult(JSON.stringify(r, null, 2));
          }}
        >
          Validar
        </button>
        {result && <pre className="mono">{result}</pre>}
      </div>
    </div>
  );
}
