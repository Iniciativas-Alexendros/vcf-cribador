import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("catálogo mínimo de átomos", () => {
  test("muestra variantes de botón, badge, input y callout", async ({
    page,
  }) => {
    await page.goto("/documentacion/ds");
    await expect(page.getByRole("heading", { level: 1, name: "Átomos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Primario" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Secundario" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Peligro" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Deshabilitado" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cargando" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(page.getByText("Neutral", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Campo de ejemplo")).toBeVisible();
    await expect(page.getByRole("note").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Estados" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vacío" })).toBeVisible();
  });

  test("/documentacion/ds cumple axe wcag2a/aa/22aa", async ({ page }) => {
    await page.goto("/documentacion/ds");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
});
