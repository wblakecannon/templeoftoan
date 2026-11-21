import type { EditorialFrontmatter } from "@/lib/content/schema";

type RigFrontmatter = Extract<EditorialFrontmatter, { contentType: "rig" }>;

const FACT_LABELS: { key: keyof RigFrontmatter; label: string }[] = [
  { key: "rigType", label: "Type" },
  { key: "genre", label: "Genre" },
  { key: "signalChain", label: "Signal chain" },
  { key: "powerSupply", label: "Power" },
];

export function RigFacts({ rig }: { rig: RigFrontmatter }) {
  const rows = FACT_LABELS.filter(({ key }) => Boolean(rig[key]));
  if (rows.length === 0) return null;

  return (
    <dl className="border-bone/10 divide-bone/10 my-8 divide-y border-y">
      {rows.map(({ key, label }) => (
        <div key={key} className="flex justify-between gap-4 py-2 text-sm">
          <dt className="text-bone/60">{label}</dt>
          <dd className="text-bone text-right font-medium">
            {String(rig[key])}
          </dd>
        </div>
      ))}
    </dl>
  );
}
