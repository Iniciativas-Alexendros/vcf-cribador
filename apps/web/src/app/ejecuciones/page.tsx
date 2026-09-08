"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteJob, listJobs, type JobManifest } from "@/lib/api";

export default function EjecucionesPage() {
  const [items, setItems] = useState<JobManifest[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const d = await listJobs();
      setItems(d.items);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div>
      <h1>Ejecuciones</h1>
      {error && <p role="alert">{error}</p>}
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Entrada</th>
              <th>Conservados</th>
              <th>Revisión</th>
              <th>Eliminados</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((j) => (
              <tr key={j.job_id}>
                <td>{j.display_name || j.input.original_name}</td>
                <td className="mono">{j.created_at}</td>
                <td>
                  <span className="badge">{j.status}</span>
                </td>
                <td>{j.summary?.input_contacts ?? "—"}</td>
                <td>{j.summary?.retained ?? "—"}</td>
                <td>{j.summary?.needs_review ?? "—"}</td>
                <td>{j.summary?.eliminated ?? "—"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/ejecuciones/${j.job_id}`}>Abrir</Link>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                    onClick={async () => {
                      await deleteJob(j.job_id);
                      await refresh();
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted">Sin ejecuciones aún.</p>}
      </div>
    </div>
  );
}
