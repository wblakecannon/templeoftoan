export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-blood text-bone font-heading my-8 border-l-4 pl-6 text-2xl font-medium tracking-wide sm:text-3xl">
      {children}
    </blockquote>
  );
}
