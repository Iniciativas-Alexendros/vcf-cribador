"use client";

import { Icon } from "@/components/ui/icon";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createJob,
  eventsUrl,
  getJob,
  uploadVcf,
  type JobManifest,
} from "@/lib/api";
import { PageHeader } from "@/components/shell/page-header";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { ErrorState } from "@/components/ui/error-state";
import { MetadataList } from "@/components/ui/metadata-list";
import { RulesSourceSelector } from "@/components/rules/rules-source-selector";
import { TomlEditor } from "@/components/rules/toml-editor";
import { RetentionNotice } from "@/components/jobs/retention-notice";
import { JobProgress } from "@/components/jobs/job-progress";
import formStyles from "@/styles/forms.module.css";

const ARTIFACTS = [
  { id: "vcf", label: "VCF" },
  { id: "audit_tsv", label: "TSV auditoría" },
  { id: "stats_json", label: "JSON estadísticas" },
  { id: "stats_markdown", label: "Markdown" },
  { id: "csv", label: "CSV" },
  { id: "json", label: "JSON" },
];

const STEPS = [
  { id: "archivo", label: "Archivo" },
  { id: "reglas", label: "Reglas" },
  { id: "salidas", label: "Salidas" },
  { id: "confirmacion", label: "Confirmación" },
];

export default function ProcesarPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
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
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = useCallback((f: File) => {
    setFile(f);
    setName(f.name.replace(/\.vcf$/i, ""));
    setUpload(null);
    setStep(1);
  }, []);

  async function doUploadAndContinue() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const u = await uploadVcf(file);
      setUpload(u);
      setStep(2);
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
      setStep(4);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!job?.job_id) return;
    const jobId = job.job_id;
    let es = new EventSource(eventsUrl(jobId));
    es.addEventListener("phase", (ev) => {
      setPhaseLog((prev) => [...prev, (ev as MessageEvent).data]);
      setReconnecting(false);
    });
    es.onerror = () => setReconnecting(true);
    const poll = setInterval(async () => {
      try {
        const d = await getJob(jobId);
        setJob(d.job);
        if (
          /completed|failed|cancelled|expired|deleted/i.test(d.job.status)
        ) {
          clearInterval(poll);
          es.close();
          setReconnecting(false);
        }
      } catch {
        setReconnecting(true);
      }
    }, 800);
    return () => {
      clearInterval(poll);
      es.close();
    };
  }, [job?.job_id]);

  return (
    <div className="zed-stack">
      <PageHeader
        title="Procesar"
        description="Importa un VCF, asocia reglas y genera artefactos trazables."
      />

      {step < 4 ? (
        <ProgressStepper
          steps={STEPS}
          current={step}
          onSelect={(i) => {
            if (i <= step) setStep(i);
          }}
        />
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      {step === 0 && (
        <Card variant="document">
          <div
            className="zed-dropzone"
            data-active={dragActive}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
          >
            <Icon name="file-arrow-up" style={{ fontSize: "2rem" }} aria-hidden={true} />
            <p style={{ margin: 0, color: "var(--zed-fg-strong)", fontWeight: 600 }}>
              Arrastra un archivo VCF o selecciónalo
            </p>
            <p className="zed-muted" style={{ margin: 0 }}>
              Formatos aceptados: .vcf / text/vcard
            </p>
            <label className="zed-button zed-button--secondary">
              Elegir archivo
              <input
                className="zed-sr-only"
                type="file"
                accept=".vcf,text/vcard"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
            </label>
          </div>
        </Card>
      )}

      {step === 1 && file && (
        <Card variant="document" className={formStyles.form}>
          <MetadataList
            items={[
              { label: "Nombre", value: file.name },
              {
                label: "Tamaño",
                value: `${(file.size / 1024).toFixed(1)} KiB`,
              },
              { label: "Tipo", value: file.type || "text/vcard" },
            ]}
          />
          <RulesSourceSelector mode={rulesMode} onChange={setRulesMode} />
          {rulesMode === "toml" ? (
            <div className={formStyles.field}>
              <label className="zed-label" htmlFor="procesar-toml">
                Configuración TOML
              </label>
              <TomlEditor id="procesar-toml" value={toml} onChange={setToml} />
            </div>
          ) : null}
          <Callout variant="verification" icon="link">
            La configuración queda asociada a esta ejecución. No altera jobs
            anteriores.
          </Callout>
          <div className={formStyles.actions}>
            <Button loading={busy} onClick={() => void doUploadAndContinue()}>
              Continuar
            </Button>
            <Button variant="secondary" onClick={() => setStep(0)}>
              Atrás
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && upload && (
        <Card variant="document" className={formStyles.form}>
          <MetadataList
            items={[
              {
                label: "Upload",
                value: upload.upload_id,
                mono: true,
                copyable: true,
              },
              {
                label: "SHA-256",
                value: upload.sha256,
                mono: true,
                copyable: true,
              },
            ]}
          />
          <div className={formStyles.field}>
            <label className="zed-label" htmlFor="job-name">
              Nombre de ejecución
            </label>
            <input
              id="job-name"
              className="zed-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={formStyles.field}>
            <label className="zed-label" htmlFor="retention">
              Retención (horas)
            </label>
            <input
              id="retention"
              className="zed-input"
              type="number"
              min={1}
              value={retention}
              onChange={(e) => setRetention(Number(e.target.value))}
            />
          </div>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="zed-label">Artefactos de salida</legend>
            <div className={formStyles.checkboxRow}>
              {ARTIFACTS.map((a) => (
                <label key={a.id} className={formStyles.checkbox}>
                  <input
                    type="checkbox"
                    checked={artifacts.includes(a.id)}
                    onChange={(e) => {
                      setArtifacts((prev) =>
                        e.target.checked
                          ? [...prev, a.id]
                          : prev.filter((x) => x !== a.id),
                      );
                    }}
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </fieldset>
          <RetentionNotice hours={retention} />
          <div className={formStyles.actions}>
            <Button onClick={() => setStep(3)}>Revisar</Button>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Atrás
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card variant="document" className={formStyles.form}>
          <h2 className="zed-title-section">Confirmación</h2>
          <ul>
            <li>Archivo: {upload?.original_name}</li>
            <li>Reglas: {rulesMode === "builtin" ? "integradas" : "TOML"}</li>
            <li>Artefactos: {artifacts.join(", ")}</li>
            <li>Retención: {retention} h</li>
          </ul>
          <p className="zed-muted">
            El archivo se procesará según la configuración de esta instancia.
          </p>
          <div className={formStyles.actions}>
            <Button loading={busy} onClick={() => void startJob()}>
              Crear ejecución
            </Button>
            <Button variant="secondary" onClick={() => setStep(2)}>
              Atrás
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && job && (
        <Card variant="document">
          <h2 className="zed-title-section">Ejecución en curso</h2>
          <p className="zed-mono zed-muted">{job.job_id}</p>
          <JobProgress
            status={job.status}
            phases={phaseLog}
            reconnecting={reconnecting}
          />
          {/completed/i.test(job.status) ? (
            <Button
              style={{ marginTop: "1rem" }}
              onClick={() => router.push(`/ejecuciones/${job.job_id}`)}
            >
              Ver resultados
            </Button>
          ) : null}
        </Card>
      )}
    </div>
  );
}
