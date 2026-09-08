/**
 * Tipos espejo de docs/api/openapi.yaml (ADR-0015).
 */
export type ArtifactKind =
  | "vcf"
  | "audit_tsv"
  | "stats_json"
  | "stats_markdown"
  | "csv"
  | "json";

export type JobStatus =
  | "created"
  | "uploading"
  | "uploaded"
  | "queued"
  | "validating"
  | "parsing"
  | "screening"
  | "normalizing"
  | "classifying"
  | "deduplicating"
  | "verifying"
  | "writing_artifacts"
  | "completed"
  | "failed"
  | "cancel_requested"
  | "cancelled"
  | "expired"
  | "deleted";

export interface Health {
  status: "ok";
  api_version: string;
  core_version: string;
  storage_mode: string;
}
