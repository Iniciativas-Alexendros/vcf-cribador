"use client";

import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { JobStatus } from "@/components/jobs/job-status";
import { listJobs, type JobManifest } from "@/lib/api";
import { useApiHealth } from "@/lib/hooks/use-api-health";

export default function HomePage() {
  const [jobs, setJobs] = useState<JobManifest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { isLocalProcessing, state } = useApiHealth();

  useEffect(() => {
    void listJobs()
      .then((d) => setJobs(d.items.slice(0, 3)))
      .catch(() => setJobs([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="zed-stack zed-animate-fade">
      <PageHeader
        eyebrow="Procesamiento VCF local"
        title="Ordena tus contactos. Conserva las decisiones."
        description="Zedazo normaliza, clasifica y revisa duplicados sin convertir tu agenda en una caja negra."
        actions={
          <>
            <Link className="zed-button zed-button--primary" href="/procesar">
              Procesar un archivo VCF
            </Link>
            <Link className="zed-button zed-button--secondary" href="/ejecuciones">
              Ver ejecuciones
            </Link>
          </>
        }
      />

      <Callout
        variant="privacy"
        title="Privacidad de esta instancia"
        icon="hard-drive"
      >
        {state === "connected" && isLocalProcessing
          ? "API en loopback: el procesamiento se ejecuta en esta máquina."
          : state === "connected"
            ? "API conectada. El frontend no afirma modo local porque la base no es loopback."
            : "No hay conexión con la API. Comprueba que el backend local esté en marcha."}
      </Callout>

      <section>
        <h2 className="zed-title-section">Flujo</h2>
        <div className="zed-grid-metrics">
          {[
            {
              icon: "file-arrow-up",
              title: "Importar",
              text: "Sube un VCF de Proton, Google o Apple.",
            },
            {
              icon: "magnifying-glass",
              title: "Revisar",
              text: "Comprende conservados, revisiones y descartes.",
            },
            {
              icon: "box-archive",
              title: "Exportar",
              text: "Descarga artefactos verificables de la ejecución.",
            },
          ].map((step) => (
            <Card key={step.title} variant="document">
              <Icon name={step.icon} aria-hidden={true} />
              <h3 style={{ margin: "0.5rem 0 0.25rem" }}>{step.title}</h3>
              <p className="zed-muted" style={{ margin: 0 }}>
                {step.text}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="zed-title-section">Actividad reciente</h2>
        {!loaded ? (
          <p className="zed-muted">Cargando ejecuciones…</p>
        ) : jobs.length === 0 ? (
          <Card variant="document">
            <EmptyState
              title="Aún no hay ejecuciones"
              description="Cuando proceses un VCF, las tres ejecuciones más recientes aparecerán aquí."
              action={
                <Link className="zed-button zed-button--primary" href="/procesar">
                  Procesar un archivo VCF
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="zed-stack">
            {jobs.map((j) => (
              <Card key={j.job_id} variant="action">
                <div
                  className="zed-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div>
                    <strong>{j.display_name || j.input.original_name}</strong>
                    <p className="zed-mono zed-muted" style={{ margin: "0.25rem 0 0" }}>
                      {j.created_at}
                    </p>
                  </div>
                  <div className="zed-row">
                    <JobStatus status={j.status} />
                    <Link
                      className="zed-button zed-button--tertiary"
                      href={`/ejecuciones/${j.job_id}`}
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="zed-title-section">Garantías</h2>
        <div className="zed-grid-metrics">
          <Card variant="outlined">
            <h3>Local</h3>
            <p className="zed-muted" style={{ margin: 0 }}>
              Self-hosted: tus datos permanecen bajo el control de la instancia.
            </p>
          </Card>
          <Card variant="outlined">
            <h3>Trazable</h3>
            <p className="zed-muted" style={{ margin: 0 }}>
              Cada cambio tiene una razón audible en auditoría y reglas.
            </p>
          </Card>
          <Card variant="outlined">
            <h3>Exportable</h3>
            <p className="zed-muted" style={{ margin: 0 }}>
              De VCF disperso a agenda verificable en formatos abiertos.
            </p>
          </Card>
        </div>
      </section>

      <p className="zed-muted">
        La automatización y <code className="zed-mono">zedazo completions</code>{" "}
        siguen en la CLI.{" "}
        <Link href="/documentacion">Ver documentación</Link>.
      </p>
    </div>
  );
}
