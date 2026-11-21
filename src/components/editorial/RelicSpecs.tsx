import type { EditorialFrontmatter } from "@/lib/content/schema";

type RelicFrontmatter = Extract<EditorialFrontmatter, { contentType: "relic" }>;

const SPEC_LABELS: { key: keyof RelicFrontmatter; label: string }[] = [
  { key: "manufacturer", label: "Manufacturer" },
  { key: "model", label: "Model" },
  { key: "modelYear", label: "Model year" },
  { key: "relicType", label: "Type" },
  { key: "circuit", label: "Circuit" },
  { key: "keyParts", label: "Key parts" },
  { key: "streetPrice", label: "Street price" },
  { key: "owner", label: "Owner" },
  { key: "verdict", label: "Verdict" },
];

export function RelicSpecs({ relic }: { relic: RelicFrontmatter }) {
  const rows = SPEC_LABELS.filter(({ key }) => Boolean(relic[key]));
  if (rows.length === 0) return null;

  return (
    <dl className="border-bone/10 divide-bone/10 my-8 divide-y border-y">
      {rows.map(({ key, label }) => (
        <div key={key} className="flex justify-between gap-4 py-2 text-sm">
          <dt className="text-bone/60">{label}</dt>
          <dd className="text-bone text-right font-medium">
            {String(relic[key])}
          </dd>
        </div>
      ))}
    </dl>
  );
}
