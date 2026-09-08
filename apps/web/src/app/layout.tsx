import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zedazo",
  description: "Cribado local de contactos VCF — self-hosted",
};

const links = [
  { href: "/", label: "Inicio" },
  { href: "/procesar", label: "Procesar" },
  { href: "/ejecuciones", label: "Ejecuciones" },
  { href: "/auditar", label: "Auditoría" },
  { href: "/reglas", label: "Reglas" },
  { href: "/documentacion", label: "Documentación" },
  { href: "/ajustes", label: "Ajustes" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <nav className="nav" aria-label="Principal">
          <Link href="/" className="brand">
            Zedazo
          </Link>
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
