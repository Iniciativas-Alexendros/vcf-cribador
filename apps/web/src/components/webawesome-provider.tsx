"use client";

import type { ReactNode } from "react";

/**
 * Web Awesome permanece como dependencia de base UI del proyecto.
 * En esta iteración la superficie visual usa tokens Zedazo + Icon local
 * (sin CDN ni CSS de tema WA que pise el contraste OKLCH).
 */
export function WebAwesomeProvider({ children }: { children: ReactNode }) {
  return children;
}
