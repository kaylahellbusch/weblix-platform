"use client";

export default function BusinessDetailError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
      <p className="font-medium">We could not load this business right now.</p>
      <p className="mt-1">Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
      >
        Retry
      </button>
    </section>
  );
}
