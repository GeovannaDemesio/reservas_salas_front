export function Campo({ rotulo, id, ...resto }) {
  const campoId = id ?? resto.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={campoId} className="text-sm font-medium text-zinc-700">
        {rotulo}
      </label>
      <input
        id={campoId}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
        {...resto}
      />
    </div>
  );
}

export const botaoPrimario =
  "rounded-lg bg-indigo-700 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-60";
export const botaoSecundario =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60";
