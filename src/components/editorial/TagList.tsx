export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="text-bone/70 border-bone/15 rounded-full border px-3 py-1 font-mono text-xs"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
