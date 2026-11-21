import { headers } from "next/headers";

/** Best-effort client identifier for rate limiting — not authentication. */
export async function getClientKey(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}
