const CORES = {
  Livre: "bg-green-100 text-green-800",
  Reservado: "bg-indigo-100 text-indigo-800",
  Ocupado: "bg-amber-100 text-amber-800",
  Bloqueado: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CORES[status] ?? "bg-zinc-100 text-zinc-800"}`}>
      {status}
    </span>
  );
}
