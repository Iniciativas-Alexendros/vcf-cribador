export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080";

export type JobManifest = {
  job_id: string;
  status: string;
  display_name?: string | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  core_version?: string;
  summary?: {
    input_contacts: number;
    retained: number;
    needs_review: number;
    eliminated: number;
    quarantine: number;
    duplicate_groups: number;
  } | null;
  artifacts: string[];
  error?: string | null;
  retention_hours?: number;
  rules?: {
    mode: string;
    sha256?: string | null;
  };
  input: {
    original_name: string;
    sha256: string;
    bytes: number;
    upload_id: string;
    source_detected?: string | null;
    vcard_version?: string | null;
  };
};

export type ContactView = {
  uid: string;
  fn_value: string;
  result: string;
  screening_rule?: string | null;
  categories: string[];
  emails: string[];
  tels: string[];
  merged_uids: string[];
};

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/v1/health`);
  return parseJson<{
    status: string;
    api_version: string;
    core_version: string;
    storage_mode: string;
  }>(res);
}

export async function uploadVcf(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/uploads`, {
    method: "POST",
    body: fd,
  });
  return parseJson<{
    upload_id: string;
    original_name: string;
    bytes: number;
    sha256: string;
  }>(res);
}

export async function createJob(body: {
  upload_id: string;
  display_name?: string;
  artifacts?: string[];
  rules?: { mode: string; toml?: string };
  retention_hours?: number;
}) {
  const res = await fetch(`${API_BASE}/api/v1/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<JobManifest>(res);
}

export async function listJobs() {
  const res = await fetch(`${API_BASE}/api/v1/jobs`);
  return parseJson<{ items: JobManifest[] }>(res);
}

export async function getJob(jobId: string) {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}`);
  return parseJson<{ job: JobManifest; warnings: unknown[] }>(res);
}

export async function cancelJob(jobId: string) {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/cancel`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteJob(jobId: string) {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function listContacts(jobId: string, q?: string, result?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (result) params.set("result", result);
  const res = await fetch(
    `${API_BASE}/api/v1/jobs/${jobId}/contacts?${params}`,
  );
  return parseJson<{ items: ContactView[] }>(res);
}

export async function listDuplicates(jobId: string) {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/duplicates`);
  return parseJson<{
    groups: { canonical_uid: string; member_uids: string[] }[];
  }>(res);
}

export async function getAudit(jobId: string) {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/audit`);
  return parseJson<{ items: { cols: string[] }[] }>(res);
}

export async function getStats(jobId: string) {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/stats`);
  return parseJson<Record<string, unknown>>(res);
}

export function artifactUrl(jobId: string, kind: string) {
  return `${API_BASE}/api/v1/jobs/${jobId}/artifacts/${kind}`;
}

export async function createAudit(upload_id: string, config_toml?: string) {
  const res = await fetch(`${API_BASE}/api/v1/audits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload_id, config_toml }),
  });
  return parseJson<JobManifest>(res);
}

export async function validateRules(toml: string) {
  const res = await fetch(`${API_BASE}/api/v1/rules/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toml }),
  });
  return parseJson<{ ok: boolean; diagnostics: { message: string }[] }>(res);
}

export function eventsUrl(jobId: string) {
  return `${API_BASE}/api/v1/jobs/${jobId}/events`;
}
