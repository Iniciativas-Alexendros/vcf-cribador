"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export default function AjustesPage() {
  const [health, setHealth] = useState<string>("");

  useEffect(() => {
    void getHealth()
      .then((h) => setHealth(JSON.stringify(h, null, 2)))
      .catch((e) => setHealth(String(e)));
  }, []);

  return (
    <div>
      <h1>Ajustes</h1>
      <div className="panel">
        <h2>API local</h2>
        <pre className="mono">{health || "…"}</pre>
        <p className="muted">
          Borrado total de datos: elimina el directorio{" "}
          <code>ZEDAZO_DATA_DIR</code> (p. ej. <code>./data</code>) con la API
          detenida. No hay telemetría remota activa por defecto.
        </p>
      </div>
    </div>
  );
}
