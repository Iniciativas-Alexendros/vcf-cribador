"use client";

import { useEffect, useRef, useState } from "react";
import {
  eventsUrl,
  getJob,
  isTerminalStatus,
  type JobManifest,
} from "@/lib/api";

export function useJobEvents(jobId: string | null) {
  const [job, setJob] = useState<JobManifest | null>(null);
  const [phases, setPhases] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastEventId = useRef<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let es: EventSource | null = null;
    let poll: number | undefined;
    let reconnectTimer: number | undefined;

    const attachListeners = (source: EventSource) => {
      source.addEventListener("phase", (ev) => {
        const me = ev as MessageEvent;
        if (me.lastEventId) lastEventId.current = me.lastEventId;
        setPhases((prev) => [...prev, String(me.data)]);
        setReconnecting(false);
      });
      source.addEventListener("metric", (ev) => {
        const me = ev as MessageEvent;
        if (me.lastEventId) lastEventId.current = me.lastEventId;
        setMetrics((prev) => [...prev, String(me.data)]);
      });
      source.addEventListener("message", (ev) => {
        const me = ev as MessageEvent;
        if (me.lastEventId) lastEventId.current = me.lastEventId;
        setMessages((prev) => [...prev, String(me.data)]);
      });
      source.onerror = () => {
        setReconnecting(true);
        source.close();
        if (cancelled) return;
        reconnectTimer = window.setTimeout(() => {
          if (!cancelled) connect();
        }, 800);
      };
    };

    const connect = () => {
      es?.close();
      const url = eventsUrl(jobId, lastEventId.current);
      es = new EventSource(url, { withCredentials: true });
      attachListeners(es);
    };

    connect();
    poll = window.setInterval(async () => {
      try {
        const j = await getJob(jobId);
        if (cancelled) return;
        setJob(j.job);
        if (isTerminalStatus(j.job.status)) {
          if (poll) window.clearInterval(poll);
          if (reconnectTimer) window.clearTimeout(reconnectTimer);
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
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
    };
  }, [jobId]);

  return { job, phases, metrics, messages, reconnecting, error, setJob };
}
