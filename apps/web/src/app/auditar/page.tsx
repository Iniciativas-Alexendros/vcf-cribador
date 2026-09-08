"use client";

import { Icon } from "@/components/ui/icon";
import { useState } from "react";
import Link from "next/link";
import { createAudit, uploadVcf } from "@/lib/api";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { ErrorState } from "@/components/ui/error-state";

export default function AuditarPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    setError(null);
    setFileMeta({ name: file.name, size: file.size });
    try {
      const u = await uploadVcf(file);
      const j = await createAudit(u.upload_id);
      setJobId(j.job_id);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="zed-stack">
      <PageHeader
        title="Auditar"
        description="Inspecciona un VCF sin generar una agenda modificada."
      />

      <Callout variant="info" title="Análisis no destructivo" icon="magnifying-glass">
        Auditar difiere de Procesar: no produce VCF de salida ni aplica deduplicación
        destructiva. Sirve para revisar integridad, avisos y riesgos.
      </Callout>

      <Card variant="document">
        <div className="zed-dropzone">
          <Icon name="file-magnifying-glass" style={{ fontSize: "1.75rem" }} aria-hidden={true} />
          <p style={{ margin: 0, fontWeight: 600, color: "var(--zed-fg-strong)" }}>
            Selecciona un VCF para analizar
          </p>
          <label className="zed-button zed-button--primary">
            {busy ? "Analizando…" : "Analizar archivo"}
            <input
              className="zed-sr-only"
              type="file"
              accept=".vcf"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
          </label>
        </div>

        {fileMeta ? (
          <p className="zed-muted" style={{ marginTop: "1rem" }}>
            Archivo: <span className="zed-mono">{fileMeta.name}</span> ·{" "}
            {(fileMeta.size / 1024).toFixed(1)} KiB
          </p>
        ) : null}

        {error ? <ErrorState message={error} /> : null}

        {jobId ? (
          <Callout variant="success" title="Análisis creado" icon="circle-check">
            <p style={{ margin: "0 0 0.75rem" }}>
              La inspección está disponible como ejecución de auditoría.
            </p>
            <Link className="zed-button zed-button--secondary" href={`/ejecuciones/${jobId}`}>
              Ver informe
            </Link>
          </Callout>
        ) : null}
      </Card>
    </div>
  );
}
