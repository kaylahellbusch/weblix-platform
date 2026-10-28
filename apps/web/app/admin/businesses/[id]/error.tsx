"use client";

export default function BusinessDetailError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
      <p className="font-medium">We could not load this business right now.</p>
      <p className="mt-1">Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Retry
      </button>
    </section>
  );
}
