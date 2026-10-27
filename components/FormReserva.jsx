"use client";

import { useEffect, useState } from "react";
import { Campo, Selecao, botaoPrimario } from "./Campo";
import { Shell, useUsuario } from "./Shell";
import { StatusBadge } from "./StatusBadge";
import { TabelaReservas } from "./TabelaReservas";

const ENDPOINTS = { S: "/api/salas", L: "/api/laboratorios" };

export function FormReserva() {
  return (
    <Shell>
      <Conteudo />
    </Shell>
  );
}

function Conteudo() {
  const { admin } = useUsuario();
  const [tipo, setTipo] = useState("S");
  const [recursos, setRecursos] = useState([]);
  const [cod, setCod] = useState("");
  const [data, setData] = useState(() => new Date().toLocaleDateString("sv-SE"));
  const [horaIni, setHoraIni] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [bloquear, setBloquear] = useState(false);
  const [dia, setDia] = useState(null);
  const [versao, setVersao] = useState(0);
  const [msg, setMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetch(ENDPOINTS[tipo])
      .then((res) => (res.ok ? res.json() : []))
      .then((lista) => ativo && setRecursos(lista));
    return () => {
      ativo = false;
    };
  }, [tipo]);

  useEffect(() => {
    if (!cod || !data) return;
    let ativo = true;
    fetch(`/api/reservas?tipo=${tipo}&cod=${encodeURIComponent(cod)}&data=${data}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((lista) => ativo && setDia(lista));
    return () => {
      ativo = false;
    };
  }, [tipo, cod, data, versao]);

  function mudarTipo(e) {
    setTipo(e.target.value);
    setCod("");
    setDia(null);
  }

  async function reservar(e) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    const res = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, cod, data, hora_ini: horaIni, hora_fim: horaFim, bloquear }),
    });
    const corpo = await res.json();
    setEnviando(false);
    setMsg({ tipo: res.ok ? "ok" : "erro", texto: corpo.mensagem ?? corpo.erro });
    if (res.ok) {
      setVersao((v) => v + 1);
      setHoraIni("");
      setHoraFim("");
      setBloquear(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Reservar recurso</h1>

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

      <form onSubmit={reservar} className="grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2">
        <Selecao rotulo="Tipo de recurso" name="tipo" value={tipo} onChange={mudarTipo}>
          <option value="S">Sala</option>
          <option value="L">Laboratório</option>
        </Selecao>
        <Selecao rotulo="Recurso" name="cod" value={cod} onChange={(e) => setCod(e.target.value)} required>
          <option value="">Selecione…</option>
          {recursos.map((r) => (
            <option key={r.cod} value={r.cod}>
              {r.nome} (cap. {r.cap})
            </option>
          ))}
        </Selecao>
        <Campo rotulo="Data" name="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <Campo rotulo="Início" name="hora_ini" type="time" value={horaIni} onChange={(e) => setHoraIni(e.target.value)} required />
          <Campo rotulo="Fim" name="hora_fim" type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} required />
        </div>
        {admin && (
          <label className="flex items-center gap-2 text-sm text-zinc-700 sm:col-span-2">
            <input type="checkbox" checked={bloquear} onChange={(e) => setBloquear(e.target.checked)} />
            Bloquear o recurso neste horário (manutenção)
          </label>
        )}
        <div className="sm:col-span-2">
          <button className={botaoPrimario} disabled={enviando}>
            {bloquear ? "Bloquear" : "Reservar"}
          </button>
        </div>
      </form>

      {cod && dia && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            Situação em {data.split("-").reverse().join("/")}
            {dia.length === 0 && <StatusBadge status="Livre" />}
          </h2>
          {dia.length > 0 && <TabelaReservas reservas={dia} />}
        </div>
      )}
    </div>
  );
}
