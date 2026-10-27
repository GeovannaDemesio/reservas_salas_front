"use client";

import { useEffect, useState } from "react";
import { Campo, Selecao, botaoPrimario, botaoSecundario } from "./Campo";
import { Shell } from "./Shell";
import { TabelaReservas } from "./TabelaReservas";

export function ConsultaReservas() {
  return (
    <Shell>
      <Conteudo />
    </Shell>
  );
}

function Conteudo() {
  const [form, setForm] = useState(() => ({
    data: new Date().toLocaleDateString("sv-SE"),
    usuario: "",
    tipo: "",
    recurso: "",
  }));
  const [filtros, setFiltros] = useState(form);
  const [reservas, setReservas] = useState(null);
  const [versao, setVersao] = useState(0);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/reservas?${new URLSearchParams(filtros)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((lista) => ativo && setReservas(lista));
    return () => {
      ativo = false;
    };
  }, [filtros, versao]);

  const muda = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function buscar(e) {
    e.preventDefault();
    setReservas(null);
    setFiltros(form);
  }

  function limpar() {
    const vazio = { data: "", usuario: "", tipo: "", recurso: "" };
    setForm(vazio);
    setReservas(null);
    setFiltros(vazio);
  }

  async function cancelar(reserva) {
    if (!confirm(`Cancelar a reserva de ${reserva.recurso} em ${reserva.data.split("-").reverse().join("/")}?`)) return;
    const res = await fetch(`/api/reservas/${reserva.cod}`, { method: "DELETE" });
    const corpo = await res.json();
    setMsg({ tipo: res.ok ? "ok" : "erro", texto: corpo.mensagem ?? corpo.erro });
    if (res.ok) setVersao((v) => v + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Consultar reservas</h1>

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

      <form onSubmit={buscar} className="grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2">
        <Campo rotulo="Data" name="data" type="date" value={form.data} onChange={muda("data")} />
        <Campo rotulo="Usuário (nome ou CPF)" name="usuario" value={form.usuario} onChange={muda("usuario")} />
        <Selecao rotulo="Tipo de recurso" name="tipo" value={form.tipo} onChange={muda("tipo")}>
          <option value="">Todos</option>
          <option value="S">Sala</option>
          <option value="L">Laboratório</option>
        </Selecao>
        <Campo rotulo="Recurso (nome ou código)" name="recurso" value={form.recurso} onChange={muda("recurso")} />
        <div className="flex gap-2 sm:col-span-2">
          <button className={botaoPrimario}>Buscar</button>
          <button type="button" className={botaoSecundario} onClick={limpar}>
            Limpar filtros
          </button>
        </div>
      </form>

      <TabelaReservas reservas={reservas} onCancelar={cancelar} />
    </div>
  );
}
