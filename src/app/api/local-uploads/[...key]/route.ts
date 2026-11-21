import fs from "node:fs";
import path from "node:path";

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), ".local-uploads");

// Matches generateObjectKey's shape exactly: submissions/YYYY/MM/[uuid]/[index]-[uuid].[ext]
const OBJECT_KEY_PATTERN =
  /^submissions\/\d{4}\/\d{2}\/[0-9a-f-]+\/\d+-[0-9a-f-]+\.[a-z0-9]+$/;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  // This route only exists to give LocalMockMediaUploadTargetService
  // something to PUT to when there's no real S3 bucket configured. If a
  // bucket IS configured, this route must never be reachable — refuse
  // rather than silently writing to local disk in that case.
  if (process.env.SUBMISSION_MEDIA_BUCKET) {
    return new Response("Not found", { status: 404 });
  }

  const { key } = await params;
  const objectKey = key.join("/");

  if (!OBJECT_KEY_PATTERN.test(objectKey)) {
    return new Response("Bad request", { status: 400 });
  }

  const fullPath = path.join(LOCAL_UPLOAD_ROOT, objectKey);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, Buffer.from(await request.arrayBuffer()));

  return new Response(null, { status: 200 });
}
