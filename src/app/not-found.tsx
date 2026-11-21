import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center"
    >
      <h1 className="font-heading text-blood text-6xl font-semibold tracking-wide sm:text-7xl">
        404
      </h1>
      <h2 className="font-heading text-bone text-xl font-medium tracking-wide uppercase sm:text-2xl">
        Page Not Found
      </h2>
      <p className="text-bone/80 max-w-md text-base sm:text-lg">
        This page was sacrificed and never returned. Toan is elsewhere.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="border-bone/20 text-bone hover:bg-bone/5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
        >
          Back to homepage
        </Link>
        <Link
          href="/sermons"
          className="border-bone/20 text-bone hover:bg-bone/5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
        >
          Sermons
        </Link>
        <Link
          href="/relics"
          className="border-bone/20 text-bone hover:bg-bone/5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
        >
          Relics
        </Link>
        <Link
          href="/rigs"
          className="border-bone/20 text-bone hover:bg-bone/5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
        >
          Rigs
        </Link>
      </div>
    </main>
  );
}
