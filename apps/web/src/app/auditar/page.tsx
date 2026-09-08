"use client";

import { useState } from "react";
import Link from "next/link";
import { createAudit, uploadVcf } from "@/lib/api";

export default function AuditarPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    setError(null);
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
    <div>
      <h1>Auditoría</h1>
      <p className="muted">
        Inspección no destructiva (caso de uso <code>audit</code>): sin VCF de
        salida.
      </p>
      <div className="panel">
        <input
          type="file"
          accept=".vcf"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
        {error && <p role="alert">{error}</p>}
        {jobId && (
          <p>
            Completado.{" "}
            <Link href={`/ejecuciones/${jobId}`}>Ver job {jobId}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
