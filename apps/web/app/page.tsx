export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef5ff,_#f8fafc_45%,_#f1f5f9)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-8 lg:px-12">
        <header className="mb-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3" aria-label="Weblix Platform home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
              W
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">Weblix Platform</p>
            </div>
          </div>
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
            Early foundation
          </span>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Built for business data + website generation
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Weblix Platform
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              A clean, extensible foundation for managing business information and
              turning it into polished, customizable websites.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium text-slate-700">
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                Next.js App Router
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                TypeScript + Tailwind
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                CI-ready checks
              </span>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/70 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-900">Current scope</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>• Bootstrap the app shell and project tooling</li>
              <li>• Add strict TypeScript and Tailwind styling</li>
              <li>• Configure lint, tests, typecheck, and build scripts</li>
              <li>• Keep the API layer intentionally minimal for later work</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
