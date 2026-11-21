import path from "node:path";
import { test, expect } from "@playwright/test";

const TEST_IMAGE = path.join(
  process.cwd(),
  "tests",
  "e2e",
  "fixtures",
  "test-photo.png",
);
// Deliberately > 1MB (Next.js's old Server Action body limit that this
// app used to hit — see upload-action.ts / next.config.ts) so this test
// actually exercises the regression, not just the two-phase code path in
// theory. Still well under the 10MB per-file limit.
const LARGE_TEST_IMAGE = path.join(
  process.cwd(),
  "tests",
  "e2e",
  "fixtures",
  "large-test-photo.png",
);

// Submissions are rate-limited per client (see rate-limit.ts). Playwright
// reuses one dev server process across the whole suite, so without this
// every test would share one bucket and later tests would spuriously hit
// "Too many submissions" — give each test its own synthetic client IP.
test.beforeEach(async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `e2e-${testInfo.testId}`,
  });
});

test("submitting the form with all required fields shows a success message", async ({
  page,
}) => {
  await page.goto("/submit");

  await page.fill("#contributorName", "Test Contributor");
  await page.fill("#contributorEmail", "test@example.com");
  await page.fill(
    "#story",
    "This is a test submission story with enough detail.",
  );
  await page.check("#rightsConfirmed");
  await page.check("#editingPermission");

  await page.click('button[type="submit"]');

  await expect(page.getByRole("status")).toContainText("Thanks — we got it.");
});

test("submitting with missing required fields shows an accessible error summary", async ({
  page,
}) => {
  await page.goto("/submit");

  await page.click('button[type="submit"]');

  const summary = page.getByRole("alert").first();
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("Name is required");
  await expect(summary).toContainText("Enter a valid email address");
  await expect(summary).toContainText("Tell us a little about it");
});

test("filling the honeypot field silently fails validation instead of succeeding", async ({
  page,
}) => {
  await page.goto("/submit");

  await page.fill("#contributorName", "Bot");
  await page.fill("#contributorEmail", "bot@example.com");
  await page.fill("#story", "Bot generated story text here.");
  await page.check("#rightsConfirmed");
  await page.check("#editingPermission");
  await page.locator("#website").fill("http://spam.example.com");

  await page.click('button[type="submit"]');

  await expect(page.getByRole("status")).not.toBeVisible();
  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("attaching a small photo and submitting still succeeds", async ({
  page,
}) => {
  await page.goto("/submit");

  await page.fill("#contributorName", "Photo Contributor");
  await page.fill("#contributorEmail", "photo@example.com");
  await page.fill("#story", "A story with a photo attached.");
  await page.setInputFiles("#photos", TEST_IMAGE);
  await page.check("#rightsConfirmed");
  await page.check("#editingPermission");

  await page.click('button[type="submit"]');

  await expect(page.getByRole("status")).toContainText("Thanks — we got it.");
});

test("attaching a photo larger than the old 1MB Server Action limit still succeeds", async ({
  page,
}) => {
  await page.goto("/submit");

  await page.fill("#contributorName", "Large Photo Contributor");
  await page.fill("#contributorEmail", "large-photo@example.com");
  await page.fill("#story", "A story with a multi-megabyte photo attached.");
  await page.setInputFiles("#photos", LARGE_TEST_IMAGE);
  await page.check("#rightsConfirmed");
  await page.check("#editingPermission");

  await page.click('button[type="submit"]');

  // Photos upload directly to S3/local disk before the form action ever
  // fires, so this can take a moment longer than the other tests.
  await expect(page.getByRole("status")).toContainText("Thanks — we got it.", {
    timeout: 15_000,
  });
});
