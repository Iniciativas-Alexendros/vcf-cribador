# Contrato API generado / espejo

Este paquete documenta el contrato TypeScript alineado con `docs/api/openapi.yaml`.

```ts
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
```

Fuente canónica: OpenAPI. Regenerar cliente cuando el YAML cambie.
