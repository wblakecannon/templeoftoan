import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PUT } from "./route";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".local-uploads");

function makeRequest(body: Uint8Array): Request {
  return new Request("http://localhost/api/local-uploads/ignored", {
    method: "PUT",
    body: body as BodyInit,
  });
}

describe("PUT /api/local-uploads/[...key]", () => {
  const validKey = [
    "submissions",
    "2026",
    "01",
    "abc12345-de67-4890-a123-456789abcdef",
    "0-fed21098-76cb-4543-b210-fedcba098765.jpg",
  ];
  const testDir = path.join(LOCAL_UPLOAD_ROOT, "submissions", "2026");

  beforeEach(() => {
    delete process.env.SUBMISSION_MEDIA_BUCKET;
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it("writes the request body to the matching path under .local-uploads/", async () => {
    const body = new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]);
    const response = await PUT(makeRequest(body), {
      params: Promise.resolve({ key: validKey }),
    });

    expect(response.status).toBe(200);
    const written = fs.readFileSync(path.join(LOCAL_UPLOAD_ROOT, ...validKey));
    expect(new Uint8Array(written)).toEqual(body);
  });

  it("refuses with 404 when SUBMISSION_MEDIA_BUCKET is set", async () => {
    process.env.SUBMISSION_MEDIA_BUCKET = "some-real-bucket";
    const response = await PUT(makeRequest(new Uint8Array([1])), {
      params: Promise.resolve({ key: validKey }),
    });

    expect(response.status).toBe(404);
  });

  it("rejects a key that doesn't match the expected object-key shape", async () => {
    const response = await PUT(makeRequest(new Uint8Array([1])), {
      params: Promise.resolve({ key: ["..", "..", "etc", "passwd"] }),
    });

    expect(response.status).toBe(400);
  });

  it("rejects a key missing the required nested structure", async () => {
    const response = await PUT(makeRequest(new Uint8Array([1])), {
      params: Promise.resolve({ key: ["not-submissions", "foo.jpg"] }),
    });

    expect(response.status).toBe(400);
  });
});
