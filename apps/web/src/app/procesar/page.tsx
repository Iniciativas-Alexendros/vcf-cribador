"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createJob,
  eventsUrl,
  getJob,
  uploadVcf,
  type JobManifest,
} from "@/lib/api";

const ARTIFACTS = [
  "vcf",
  "audit_tsv",
  "stats_json",
  "stats_markdown",
  "csv",
  "json",
];

export default function ProcesarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [upload, setUpload] = useState<{
    upload_id: string;
    sha256: string;
    bytes: number;
    original_name: string;
  } | null>(null);
  const [rulesMode, setRulesMode] = useState<"builtin" | "toml">("builtin");
  const [toml, setToml] = useState("");
  const [artifacts, setArtifacts] = useState<string[]>([
    "vcf",
    "audit_tsv",
    "stats_json",
    "csv",
    "json",
  ]);
  const [name, setName] = useState("");
  const [retention, setRetention] = useState(24);
  const [job, setJob] = useState<JobManifest | null>(null);
  const [phaseLog, setPhaseLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback((f: File) => {
    setFile(f);
    setName(f.name.replace(/\.vcf$/i, ""));
    setStep(2);
  }, []);

  async function doUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const u = await uploadVcf(file);
      setUpload(u);
      setStep(3);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function startJob() {
    if (!upload) return;
    setBusy(true);
    setError(null);
    try {
      const j = await createJob({
        upload_id: upload.upload_id,
        display_name: name || upload.original_name,
        artifacts,
        retention_hours: retention,
        rules:
          rulesMode === "toml"
            ? { mode: "toml_inline", toml }
            : { mode: "builtin" },
      });
      setJob(j);
      setStep(5);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!job) return;
    const es = new EventSource(eventsUrl(job.job_id));
    es.addEventListener("phase", (ev) => {
      setPhaseLog((prev) => [...prev, (ev as MessageEvent).data]);
    });
    const poll = setInterval(async () => {
      try {
        const d = await getJob(job.job_id);
        setJob(d.job);
        if (
          ["Completed", "completed", "Failed", "failed", "Cancelled", "cancelled"].includes(
            d.job.status,
          ) ||
          /completed|failed|cancelled/i.test(d.job.status)
        ) {
          clearInterval(poll);
          es.close();
        }
      } catch {
        /* ignore */
      }
    }, 800);
    return () => {
      clearInterval(poll);
      es.close();
    };
  }, [job?.job_id]);

  return (
    <div>
      <h1>Procesar</h1>
      <div className="steps">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={step === n ? "active" : ""}>
            Paso {n}
          </span>
        ))}
      </div>
      {error && (
        <p className="panel" style={{ color: "var(--danger)" }} role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onDrop(f);
          }}
        >
          <p>Arrastra un VCF o selecciona un archivo</p>
          <input
            type="file"
            accept=".vcf,text/vcard"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onDrop(f);
            }}
          />
        </div>
      )}

      {step === 2 && file && (
        <div className="panel">
          <p>
            <strong>{file.name}</strong> — {(file.size / 1024).toFixed(1)} KiB
          </p>
          <label>Reglas</label>
          <select
            value={rulesMode}
            onChange={(e) => setRulesMode(e.target.value as "builtin" | "toml")}
          >
            <option value="builtin">Integradas</option>
            <option value="toml">TOML inline</option>
          </select>
          {rulesMode === "toml" && (
            <>
              <label>zedazo.toml (append por defecto; replace=true sustituye)</label>
              <textarea
                rows={10}
                className="mono"
                value={toml}
                onChange={(e) => setToml(e.target.value)}
              />
            </>
          )}
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <button className="btn" disabled={busy} onClick={doUpload}>
              Continuar
            </button>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Atrás
            </button>
          </div>
        </div>
      )}

      {step === 3 && upload && (
        <div className="panel">
          <p className="mono">
            upload {upload.upload_id} · sha256 {upload.sha256.slice(0, 16)}…
          </p>
          <label>Nombre de ejecución</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label>Retención (horas)</label>
          <input
            type="number"
            value={retention}
            onChange={(e) => setRetention(Number(e.target.value))}
          />
          <label>Artefactos</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {ARTIFACTS.map((a) => (
              <label key={a} style={{ display: "flex", gap: "0.35rem" }}>
                <input
                  type="checkbox"
                  checked={artifacts.includes(a)}
                  onChange={(e) => {
                    setArtifacts((prev) =>
                      e.target.checked
                        ? [...prev, a]
                        : prev.filter((x) => x !== a),
                    );
                  }}
                />
                {a}
              </label>
            ))}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <button className="btn" onClick={() => setStep(4)}>
              Revisar
            </button>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              Atrás
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="panel">
          <h2>Revisión</h2>
          <ul>
            <li>Archivo: {upload?.original_name}</li>
            <li>Reglas: {rulesMode}</li>
            <li>Artefactos: {artifacts.join(", ")}</li>
            <li>Retención: {retention} h</li>
          </ul>
          <button className="btn" disabled={busy} onClick={startJob}>
            Ejecutar
          </button>
        </div>
      )}

      {step === 5 && job && (
        <div className="panel">
          <h2>Progreso</h2>
          <p>
            Job <span className="mono">{job.job_id}</span> — estado{" "}
            <span className="badge">{job.status}</span>
          </p>
          <ul className="mono">
            {phaseLog.slice(-12).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
          {/completed/i.test(job.status) && (
            <button
              className="btn"
              onClick={() => router.push(`/ejecuciones/${job.job_id}`)}
            >
              Ver resultados
            </button>
          )}
        </div>
      )}
    </div>
  );
}
