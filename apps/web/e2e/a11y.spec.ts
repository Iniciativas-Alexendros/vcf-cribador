import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("navegación básica Archivo Vivo", () => {
  test("home muestra marca y CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ordena tus contactos",
    );
    await expect(
      page.getByRole("link", { name: /Procesar un archivo VCF/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Secciones" })).toBeVisible();
  });

  test("procesar carga el flujo", async ({ page }) => {
    await page.goto("/procesar");
    await expect(page.getByRole("heading", { name: "Procesar" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Progreso del proceso" }),
    ).toBeVisible();
  });

  test("ejecuciones carga listado", async ({ page }) => {
    await page.goto("/ejecuciones");
    await expect(
      page.getByRole("heading", { level: 1, name: "Ejecuciones" }),
    ).toBeVisible();
  });

  test("skip link existe", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("link", { name: /Saltar al contenido/i });
    await expect(skip).toHaveCount(1);
  });
});

for (const path of ["/", "/procesar", "/ejecuciones"] as const) {
  test(`${path} cumple criterios axe wcag2a/aa/22aa`, async ({ page }) => {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
