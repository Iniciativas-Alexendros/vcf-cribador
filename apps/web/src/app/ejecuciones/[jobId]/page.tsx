"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  artifactUrl,
  getAudit,
  getJob,
  getStats,
  listContacts,
  listDuplicates,
  type ContactView,
  type JobManifest,
} from "@/lib/api";

type Tab =
  | "resumen"
  | "contactos"
  | "duplicados"
  | "auditoria"
  | "estadisticas"
  | "exportar"
  | "metadatos";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = String(params.jobId);
  const [tab, setTab] = useState<Tab>("resumen");
  const [job, setJob] = useState<JobManifest | null>(null);
  const [contacts, setContacts] = useState<ContactView[]>([]);
  const [q, setQ] = useState("");
  const [result, setResult] = useState("");
  const [dups, setDups] = useState<
    { canonical_uid: string; member_uids: string[] }[]
  >([]);
  const [audit, setAudit] = useState<{ cols: string[] }[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getJob(jobId)
      .then((d) => setJob(d.job))
      .catch((e) => setError(String(e)));
  }, [jobId]);

  useEffect(() => {
    if (tab === "contactos") {
      void listContacts(jobId, q || undefined, result || undefined)
        .then((d) => setContacts(d.items))
        .catch((e) => setError(String(e)));
    }
    if (tab === "duplicados") {
      void listDuplicates(jobId)
        .then((d) => setDups(d.groups))
        .catch((e) => setError(String(e)));
    }
    if (tab === "auditoria") {
      void getAudit(jobId)
        .then((d) => setAudit(d.items))
        .catch((e) => setError(String(e)));
    }
    if (tab === "estadisticas") {
      void getStats(jobId)
        .then(setStats)
        .catch((e) => setError(String(e)));
    }
  }, [tab, jobId, q, result]);

  const tabs: { id: Tab; label: string }[] = useMemo(
    () => [
      { id: "resumen", label: "Resumen" },
      { id: "contactos", label: "Contactos" },
      { id: "duplicados", label: "Duplicados" },
      { id: "auditoria", label: "Auditoría" },
      { id: "estadisticas", label: "Estadísticas" },
      { id: "exportar", label: "Exportar" },
      { id: "metadatos", label: "Metadatos" },
    ],
    [],
  );

  if (!job) {
    return <p className="muted">{error || "Cargando…"}</p>;
  }

  return (
    <div>
      <h1>{job.display_name || job.job_id}</h1>
      <p className="muted mono">{job.job_id}</p>
      {error && <p role="alert">{error}</p>}
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="panel">
          <p>
            Estado: <span className="badge">{job.status}</span>
          </p>
          <ul>
            <li>Entrada: {job.summary?.input_contacts ?? "—"}</li>
            <li>Conservados: {job.summary?.retained ?? "—"}</li>
            <li>Needs review: {job.summary?.needs_review ?? "—"}</li>
            <li>Eliminados: {job.summary?.eliminated ?? "—"}</li>
            <li>Cuarentena: {job.summary?.quarantine ?? "—"}</li>
            <li>Grupos duplicados: {job.summary?.duplicate_groups ?? "—"}</li>
            <li className="mono">SHA-256 input: {job.input.sha256}</li>
          </ul>
        </div>
      )}

      {tab === "contactos" && (
        <div className="panel">
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <input
              placeholder="Buscar nombre/email/tel"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={result} onChange={(e) => setResult(e.target.value)}>
              <option value="">Todos</option>
              <option value="conserved">conserved</option>
              <option value="needs_review">needs_review</option>
              <option value="eliminated">eliminated</option>
              <option value="quarantine">quarantine</option>
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Resultado</th>
                <th>Regla</th>
                <th>Emails</th>
                <th>Tels</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.uid}>
                  <td>{c.fn_value}</td>
                  <td>
                    <span className={`badge ${c.result}`}>{c.result}</span>
                  </td>
                  <td className="mono">{c.screening_rule}</td>
                  <td className="mono">{c.emails.join(", ")}</td>
                  <td className="mono">{c.tels.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "duplicados" && (
        <div className="panel">
          {dups.map((g) => (
            <div key={g.canonical_uid} style={{ marginBottom: "1rem" }}>
              <strong className="mono">Canónico: {g.canonical_uid}</strong>
              <ul>
                {g.member_uids.map((m) => (
                  <li key={m} className="mono">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {dups.length === 0 && <p className="muted">Sin grupos.</p>}
        </div>
      )}

      {tab === "auditoria" && (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="table">
            <tbody>
              {audit.slice(0, 200).map((row, i) => (
                <tr key={i}>
                  {row.cols.map((c, j) => (
                    <td key={j} className="mono">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <a href={artifactUrl(jobId, "audit_tsv")}>Descargar TSV</a>
        </div>
      )}

      {tab === "estadisticas" && (
        <div className="panel">
          <pre className="mono">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      {tab === "exportar" && (
        <div className="panel">
          <ul>
            {(job.artifacts.length
              ? job.artifacts
              : ["vcf", "audit_tsv", "stats_json", "csv", "json"]
            ).map((k) => (
              <li key={k}>
                <a href={artifactUrl(jobId, k)}>Descargar {k}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "metadatos" && (
        <div className="panel">
          <pre className="mono">{JSON.stringify(job, null, 2)}</pre>
          <p className="muted">
            Verificación I1–I7 integrada en el pipeline del core (no es un sello
            GUI independiente).
          </p>
        </div>
      )}
    </div>
  );
}
