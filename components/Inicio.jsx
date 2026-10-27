"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, useUsuario } from "./Shell";
import { TabelaReservas } from "./TabelaReservas";

const ATALHOS = [
  { href: "/reservar", titulo: "Reservar", texto: "Reserve uma sala ou laboratório" },
  { href: "/reservas", titulo: "Consultar reservas", texto: "Filtre por data, usuário e recurso" },
  { href: "/salas", titulo: "Salas", texto: "Veja as salas de aula" },
  { href: "/laboratorios", titulo: "Laboratórios", texto: "Veja os laboratórios" },
];

export function Inicio() {
  return (
    <Shell>
      <Conteudo />
    </Shell>
  );
}

function Conteudo() {
  const { nome } = useUsuario();
  const [hoje] = useState(() => new Date().toLocaleDateString("sv-SE"));
  const [reservas, setReservas] = useState(null);

  useEffect(() => {
    fetch(`/api/reservas?data=${hoje}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setReservas);
  }, [hoje]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-white">Olá, {nome}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {ATALHOS.map((atalho) => (
          <Link
            key={atalho.href}
            href={atalho.href}
            className="rounded-xl bg-white p-6 shadow transition-shadow hover:shadow-lg"
          >
            <h2 className="font-semibold text-indigo-900">{atalho.titulo}</h2>
            <p className="mt-1 text-sm text-zinc-600">{atalho.texto}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-white">Reservas de hoje</h2>
      <TabelaReservas reservas={reservas} />
    </div>
  );
}
