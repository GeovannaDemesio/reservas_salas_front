"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Campo, botaoPrimario } from "@/components/Campo";

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, senha }),
    });
    if (res.ok) return router.replace("/salas");
    setErro((await res.json()).erro ?? "Erro ao entrar.");
    setEnviando(false);
  }

  return (
    <main className="m-auto w-full max-w-md px-4 py-8">
      <form onSubmit={entrar} className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-zinc-900">Entrar</h1>
        {erro && (
          <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
            {erro}
          </p>
        )}
        <Campo rotulo="CPF" name="cpf" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
        <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <button className={botaoPrimario} disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-indigo-700 underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </main>
  );
}
