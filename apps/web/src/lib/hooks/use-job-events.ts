"use client";

import { useEffect, useRef, useState } from "react";
import { eventsUrl, getJob, type JobManifest } from "@/lib/api";

export function useJobEvents(jobId: string | null) {
  const [job, setJob] = useState<JobManifest | null>(null);
  const [phases, setPhases] = useState<string[]>([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastEventId = useRef<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let es: EventSource | null = null;
    let poll: number | undefined;

    const connect = () => {
      setReconnecting(false);
      const url = eventsUrl(jobId);
      es = new EventSource(url);
      es.addEventListener("phase", (ev) => {
        const me = ev as MessageEvent;
        if (me.lastEventId) lastEventId.current = me.lastEventId;
        setPhases((prev) => [...prev, String(me.data)]);
      });
      es.onerror = () => {
        setReconnecting(true);
        es?.close();
      };
    };

    connect();
    poll = window.setInterval(async () => {
      try {
        const j = await getJob(jobId);
        if (cancelled) return;
        setJob(j.job);
        if (
          j.job.status === "completed" ||
          j.job.status === "failed" ||
          j.job.status === "cancelled" ||
          j.job.status === "expired" ||
          j.job.status === "deleted"
        ) {
          if (poll) window.clearInterval(poll);
          es?.close();
          setReconnecting(false);
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }, 1500);

    return () => {
      cancelled = true;
      es?.close();
      if (poll) window.clearInterval(poll);
    };
  }, [jobId]);

  return { job, phases, reconnecting, error, setJob };
}
