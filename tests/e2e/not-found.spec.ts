import { test, expect } from "@playwright/test";

test("visiting an unknown route renders the custom 404 page", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);

  await expect(
    page.getByRole("heading", { level: 1, name: "404" }),
  ).toBeVisible();
  await expect(page.getByText(/sacrificed/i)).toBeVisible();

  await page.getByRole("link", { name: "Back to homepage" }).click();
  await expect(page).toHaveURL("/");
});
