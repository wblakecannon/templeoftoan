import { test, expect } from "@playwright/test";

test("robots.txt disallows all crawling when indexing is not explicitly enabled", async ({
  page,
}) => {
  const response = await page.goto("/robots.txt");
  const body = await response?.text();

  expect(body).toContain("Disallow: /");
  expect(body).not.toContain("Sitemap:");
});

test("sitemap.xml is empty when indexing is not explicitly enabled", async ({
  page,
}) => {
  const response = await page.goto("/sitemap.xml");
  const body = await response?.text();

  expect(body).not.toContain("<url>");
});

test("pages send a noindex X-Robots-Tag header by default", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
});

test("rss.xml is not available when indexing is not explicitly enabled", async ({
  page,
}) => {
  const response = await page.goto("/rss.xml");
  expect(response?.status()).toBe(404);
});
