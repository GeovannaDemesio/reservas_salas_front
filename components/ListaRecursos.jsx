"use client";

import { useCallback, useEffect, useState } from "react";
import { Campo, botaoPrimario, botaoSecundario } from "./Campo";
import { Shell, useUsuario } from "./Shell";

// props: titulo ("Salas"), singular ("sala"), endpoint ("/api/salas")
const vazio = { cod: "", nome: "", cap: "", loc: "" };

export function ListaRecursos(props) {
  return (
    <Shell>
      <Conteudo {...props} />
    </Shell>
  );
}

function Conteudo({ titulo, singular, endpoint }) {
  const { admin } = useUsuario();
  const [itens, setItens] = useState(null);
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState(null); // código sendo editado
  const [msg, setMsg] = useState(null); // { tipo: "erro" | "ok", texto }
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    const res = await fetch(endpoint);
    if (res.ok) setItens(await res.json());
    else setMsg({ tipo: "erro", texto: (await res.json()).erro ?? "Erro ao carregar." });
  }, [endpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function salvar(e) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    const res = await fetch(editando ? `${endpoint}/${encodeURIComponent(editando)}` : endpoint, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const corpo = await res.json();
    setEnviando(false);
    if (!res.ok) return setMsg({ tipo: "erro", texto: corpo.erro });
    setMsg({ tipo: "ok", texto: corpo.mensagem });
    setForm(vazio);
    setEditando(null);
    carregar();
  }

  async function excluir(item) {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    const res = await fetch(`${endpoint}/${encodeURIComponent(String(item.cod))}`, { method: "DELETE" });
    const corpo = await res.json();
    setMsg({ tipo: res.ok ? "ok" : "erro", texto: corpo.mensagem ?? corpo.erro });
    if (res.ok) carregar();
  }

  function editar(item) {
    setEditando(String(item.cod));
    setForm({ cod: String(item.cod), nome: item.nome, cap: String(item.cap), loc: item.loc });
    setMsg(null);
  }

  const muda = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">{titulo}</h1>

      {msg && (
        <p
          role="alert"
          className={`rounded-lg px-4 py-2 text-sm ${
            msg.tipo === "erro" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {msg.texto}
        </p>
      )}

      {admin ? (
        <form onSubmit={salvar} className="grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2">
          <h2 className="font-medium text-zinc-900 sm:col-span-2">
            {editando ? `Editar ${singular}` : `Nova ${singular}`}
          </h2>
          <Campo rotulo="Código" name="cod" maxLength={3} value={form.cod} onChange={muda("cod")} disabled={!!editando} required />
          <Campo rotulo="Nome" name="nome" maxLength={50} value={form.nome} onChange={muda("nome")} required />
          <Campo rotulo="Capacidade" name="cap" type="number" min={1} value={form.cap} onChange={muda("cap")} required />
          <Campo rotulo="Localização" name="loc" maxLength={55} value={form.loc} onChange={muda("loc")} required />
          <div className="flex gap-2 sm:col-span-2">
            <button className={botaoPrimario} disabled={enviando}>
              {editando ? "Salvar alterações" : "Cadastrar"}
            </button>
            {editando && (
              <button
                type="button"
                className={botaoSecundario}
                onClick={() => {
                  setEditando(null);
                  setForm(vazio);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="rounded-lg bg-white/90 px-4 py-2 text-sm text-zinc-700">
          Apenas o administrador pode cadastrar, editar ou excluir. Você pode consultar a lista abaixo.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm text-zinc-900">
          <thead className="border-b border-zinc-200 text-zinc-600">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Capacidade</th>
              <th className="px-4 py-3">Localização</th>
              {admin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {itens === null && (
              <tr>
                <td className="px-4 py-3 text-zinc-500" colSpan={5}>
                  Carregando…
                </td>
              </tr>
            )}
            {itens?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-zinc-500" colSpan={5}>
                  Nada cadastrado ainda.
                </td>
              </tr>
            )}
            {itens?.map((item) => (
              <tr key={item.cod} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{item.cod}</td>
                <td className="px-4 py-3">{item.nome}</td>
                <td className="px-4 py-3">{item.cap}</td>
                <td className="px-4 py-3">{item.loc}</td>
                {admin && (
                  <td className="flex justify-end gap-2 px-4 py-3">
                    <button className={botaoSecundario} onClick={() => editar(item)}>
                      Editar
                    </button>
                    <button className={`${botaoSecundario} text-red-700`} onClick={() => excluir(item)}>
                      Excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
