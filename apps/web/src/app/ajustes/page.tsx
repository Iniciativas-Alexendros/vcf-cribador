"use client";

import { useEffect, useState } from "react";
import { API_BASE, getHealth } from "@/lib/api";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { MetadataList } from "@/components/ui/metadata-list";
import { useTheme } from "@/lib/hooks/use-theme";
import { useApiHealth } from "@/lib/hooks/use-api-health";
import formStyles from "@/styles/forms.module.css";

export default function AjustesPage() {
  const { preference, setPreference } = useTheme();
  const { state, health, isLocalProcessing, refresh } = useApiHealth();
  const [raw, setRaw] = useState("");

  useEffect(() => {
    void getHealth()
      .then((h) => setRaw(JSON.stringify(h, null, 2)))
      .catch((e) => setRaw(String(e)));
  }, []);

  return (
    <div className="zed-stack">
      <PageHeader
        title="Ajustes"
        description="Apariencia, privacidad y estado de la instancia self-hosted."
      />

      <Card variant="document" className={formStyles.form}>
        <h2 className="zed-title-section">Apariencia</h2>
        <div className={formStyles.field}>
          <label className="zed-label" htmlFor="ajustes-tema">
            Tema
          </label>
          <select
            id="ajustes-tema"
            className="zed-input"
            value={preference}
            onChange={(e) =>
              setPreference(e.target.value as "system" | "light" | "dark")
            }
          >
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
        <p className="zed-muted" style={{ margin: 0 }}>
          El tamaño de texto respeta la preferencia del navegador. Usa zoom del
          sistema o del navegador para ampliar.
        </p>
      </Card>

      <Card variant="document">
        <h2 className="zed-title-section">Privacidad y datos</h2>
        <Callout variant="privacy" icon="hard-drive">
          {isLocalProcessing
            ? "El frontend apunta a una API en loopback (procesamiento local)."
            : "El frontend no afirma procesamiento local porque la API no está en loopback."}
        </Callout>
        <MetadataList
          items={[
            {
              label: "Modo almacenamiento",
              value: health?.storage_mode || "desconocido",
              mono: true,
            },
            {
              label: "Retención",
              value: "Configurable por job (horas)",
            },
          ]}
        />
        <p className="zed-muted">
          Borrado de datos: detén la API y elimina el directorio{" "}
          <code className="zed-mono">ZEDAZO_DATA_DIR</code> (p. ej.{" "}
          <code className="zed-mono">./data</code>). No hay telemetría remota por
          defecto.
        </p>
      </Card>

      <Card variant="document" className="zed-stack">
        <h2 className="zed-title-section">Conectividad</h2>
        <p>
          Estado:{" "}
          <strong>
            {state === "connected"
              ? "API conectada"
              : state === "disconnected"
                ? "Sin conexión"
                : "Comprobando…"}
          </strong>
        </p>
        <MetadataList
          items={[
            { label: "URL API", value: API_BASE, mono: true, copyable: true },
          ]}
        />
        <button
          type="button"
          className="zed-button zed-button--secondary"
          onClick={() => void refresh()}
        >
          Comprobar salud
        </button>
        <pre className="zed-mono" style={{ overflow: "auto" }}>
          {raw || "…"}
        </pre>
      </Card>

      <Card variant="document">
        <h2 className="zed-title-section">Información</h2>
        <MetadataList
          items={[
            { label: "Frontend", value: "0.5.0-draft", mono: true },
            {
              label: "API",
              value: health?.api_version || "—",
              mono: true,
            },
            {
              label: "Core",
              value: health?.core_version || "—",
              mono: true,
            },
          ]}
        />
      </Card>
    </div>
  );
}
