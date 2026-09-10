import { test } from "@playwright/test";
import path from "path";

const OUT = path.resolve(process.cwd(), "../../docs/screenshots");

test.beforeEach(() => {
  test.skip(
    !process.env.ZEDAZO_SCREENSHOTS,
    "Exportar capturas: ZEDAZO_SCREENSHOTS=1 pnpm test:e2e -- e2e/screenshots.spec.ts",
  );
});

const routes: { slug: string; path: string }[] = [
  { slug: "home", path: "/" },
  { slug: "procesar", path: "/procesar" },
  { slug: "ejecuciones", path: "/ejecuciones" },
  { slug: "auditar", path: "/auditar" },
  { slug: "reglas", path: "/reglas" },
  { slug: "ajustes", path: "/ajustes" },
  { slug: "acceso", path: "/acceso" },
];

for (const scheme of ["light", "dark"] as const) {
  test.describe(`capturas ${scheme}`, () => {
    test.use({
      colorScheme: scheme,
      viewport: { width: 1440, height: 900 },
    });

    for (const route of routes) {
      test(`${route.slug}`, async ({ page }) => {
        await page.addInitScript((pref) => {
          localStorage.setItem("zedazo-theme", pref);
        }, scheme);
        await page.goto(route.path, { waitUntil: "networkidle" });
        await page.waitForTimeout(400);
        await page.screenshot({
          path: path.join(OUT, `${route.slug}-${scheme}.png`),
          fullPage: false,
        });
      });
    }
  });
}
