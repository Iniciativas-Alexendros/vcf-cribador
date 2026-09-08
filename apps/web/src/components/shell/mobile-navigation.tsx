"use client";

import Link from "next/link";
import { NAV_ITEMS } from "./app-sidebar";
import styles from "@/styles/shell.module.css";
import { usePathname } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({ open, onClose }: Props) {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="Cerrar navegación"
        onClick={onClose}
      />
      <nav aria-label="Navegación móvil" className="zed-sr-only">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
