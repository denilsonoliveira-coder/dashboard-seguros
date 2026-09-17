"use client";
export default function ErrorPage({ error, reset }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-8">
      <section className="max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-rose-700">Não foi possível carregar o dashboard</h1>
        <p className="mt-3 text-sm text-slate-600">{error?.message || "Erro inesperado na renderização."}</p>
        <button onClick={reset} className="mt-5 rounded-xl bg-[#0A2D87] px-4 py-2 text-white">Tentar novamente</button>
      </section>
    </main>
  );
}
