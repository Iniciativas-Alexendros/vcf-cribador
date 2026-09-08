"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE, getHealth } from "@/lib/api";

export type ConnectionState = "checking" | "connected" | "disconnected";

function isLoopbackBase(base: string) {
  try {
    const url = new URL(base);
    return (
      url.hostname === "127.0.0.1" ||
      url.hostname === "localhost" ||
      url.hostname === "::1"
    );
  } catch {
    return false;
  }
}

export function useApiHealth(pollMs = 30000) {
  const [state, setState] = useState<ConnectionState>("checking");
  const [health, setHealth] = useState<{
    status: string;
    api_version: string;
    core_version: string;
    storage_mode: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const h = await getHealth();
      setHealth(h);
      setState("connected");
    } catch {
      setHealth(null);
      setState("disconnected");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, refresh]);

  return {
    state,
    health,
    refresh,
    isLocalProcessing: isLoopbackBase(API_BASE),
    apiBase: API_BASE,
  };
}
