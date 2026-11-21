import { test, expect } from "@playwright/test";

test("about page renders mission copy", async ({ page }) => {
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { level: 1, name: "About" }),
  ).toBeVisible();
  await expect(page.getByRole("main").getByText(/receive toan/i)).toBeVisible();
});
