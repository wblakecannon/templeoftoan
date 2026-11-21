export function ContributorNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="bg-bone/5 border-blood text-bone/80 my-8 border-l-4 p-4 text-sm">
      {children}
    </aside>
  );
}
