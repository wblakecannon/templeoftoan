"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center"
    >
      <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-4xl">
        Something Broke
      </h1>
      <p className="text-bone/80 max-w-md text-base sm:text-lg">
        Looks like a chain snapped somewhere. Try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="border-bone/20 text-bone hover:bg-bone/5 mt-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-6 py-3 text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
