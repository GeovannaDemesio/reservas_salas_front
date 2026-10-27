import { botaoSecundario } from "./Campo";
import { StatusBadge } from "./StatusBadge";

const NOME_TIPO = { S: "Sala", L: "Laboratório" };

export function TabelaReservas({ reservas, onCancelar }) {
  const colunas = onCancelar ? 6 : 5;

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="w-full text-left text-sm text-zinc-900">
        <thead className="border-b border-zinc-200 text-zinc-600">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Horário</th>
            <th className="px-4 py-3">Recurso</th>
            <th className="px-4 py-3">Usuário</th>
            <th className="px-4 py-3">Status</th>
            {onCancelar && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {reservas === null && (
            <tr>
              <td className="px-4 py-3 text-zinc-500" colSpan={colunas}>
                Carregando…
              </td>
            </tr>
          )}
          {reservas?.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-zinc-500" colSpan={colunas}>
                Nenhuma reserva encontrada.
              </td>
            </tr>
          )}
          {reservas?.map((r) => (
            <tr key={r.cod} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-3">{r.data.split("-").reverse().join("/")}</td>
              <td className="px-4 py-3">
                {r.horaIni} – {r.horaFim}
              </td>
              <td className="px-4 py-3">
                {NOME_TIPO[r.tipo]} {r.recurso}
              </td>
              <td className="px-4 py-3">{r.usuario}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              {onCancelar && (
                <td className="px-4 py-3 text-right">
                  {r.podeCancelar && (
                    <button className={`${botaoSecundario} text-red-700`} onClick={() => onCancelar(r)}>
                      Cancelar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
