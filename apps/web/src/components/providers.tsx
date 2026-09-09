"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/hooks/use-theme";
import { WebAwesomeProvider } from "@/components/webawesome-provider";
import { AppShell } from "@/components/shell/app-shell";
import { AuthGate } from "@/components/auth-gate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <WebAwesomeProvider>
        <AuthGate>
          <ShellOrBare>{children}</ShellOrBare>
        </AuthGate>
      </WebAwesomeProvider>
    </ThemeProvider>
  );
}

function ShellOrBare({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/acceso") {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
