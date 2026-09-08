"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/hooks/use-theme";
import { WebAwesomeProvider } from "@/components/webawesome-provider";
import { AppShell } from "@/components/shell/app-shell";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WebAwesomeProvider>
        <AppShell>{children}</AppShell>
      </WebAwesomeProvider>
    </ThemeProvider>
  );
}
