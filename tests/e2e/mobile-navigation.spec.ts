import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile menu opens, links work, and can be closed", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const panel = page.locator("#mobile-nav-panel");
  await expect(panel).toBeVisible();

  await panel.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL("/about");
});
