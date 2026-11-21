/**
 * Search indexing is opt-in, not opt-out. Only the real production
 * deployment sets NEXT_PUBLIC_ENABLE_INDEXING=true. Every other
 * environment (local dev, previews, dev.templeoftoan.com) is
 * noindexed by default, so nobody has to remember to configure a
 * non-production environment correctly.
 */
export function isIndexingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true";
}
