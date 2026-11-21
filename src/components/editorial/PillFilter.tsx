"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function parseParamList(
  searchParams: URLSearchParams,
  param: string,
): string[] {
  const raw = searchParams.get(param);
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

export function PillFilter({
  label,
  param,
  availableValues,
  basePath,
}: {
  label: string;
  param: string;
  availableValues: string[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = parseParamList(searchParams, param);

  function toggleValue(value: string) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    const params = new URLSearchParams(searchParams);
    if (next.length > 0) {
      params.set(param, next.join(","));
    } else {
      params.delete(param);
    }
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  if (availableValues.length === 0) return null;

  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="text-bone/60 mb-2 w-full font-mono text-xs tracking-[0.15em] uppercase">
        {label}
      </legend>
      {availableValues.map((value) => {
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleValue(value)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
              isSelected
                ? "border-blood bg-blood text-abyss"
                : "border-bone/15 text-bone/70 hover:border-bone/30"
            }`}
          >
            {value}
          </button>
        );
      })}
    </fieldset>
  );
}
