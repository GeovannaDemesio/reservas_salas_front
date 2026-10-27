"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Campo, botaoPrimario } from "@/components/Campo";

const inicial = { nome: "", cpf: "", dt_nasc: "", email: "", celular: "", senha: "", confirmar: "" };

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const campo = (name) => ({
    name,
    value: form[name],
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
    required: true,
  });

  async function cadastrar(e) {
    e.preventDefault();
    if (form.senha !== form.confirmar) return setErro("As senhas não conferem.");
    setEnviando(true);
    setErro("");
    const dados = { ...form, confirmar: undefined };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (res.ok) return router.replace("/");
    setErro((await res.json()).erro ?? "Erro ao cadastrar.");
    setEnviando(false);
  }

  return (
    <main className="m-auto w-full max-w-lg px-4 py-8">
      <form onSubmit={cadastrar} className="flex flex-col gap-4 rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-zinc-900">Criar conta</h1>
        {erro && (
          <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
            {erro}
          </p>
        )}
        <Campo rotulo="Nome completo" autoComplete="name" {...campo("nome")} />
        <Campo rotulo="CPF" inputMode="numeric" placeholder="000.000.000-00" {...campo("cpf")} />
        <Campo rotulo="Data de nascimento" type="date" min="1900-01-01" max="9999-12-31" {...campo("dt_nasc")} />
        <Campo rotulo="E-mail" type="email" autoComplete="email" {...campo("email")} />
        <Campo rotulo="Celular" type="tel" placeholder="(11) 91234-5678" {...campo("celular")} />
        <Campo rotulo="Senha (mín. 6 caracteres)" type="password" autoComplete="new-password" {...campo("senha")} />
        <Campo rotulo="Confirmar senha" type="password" autoComplete="new-password" {...campo("confirmar")} />
        <button className={botaoPrimario} disabled={enviando}>
          {enviando ? "Cadastrando…" : "Cadastrar"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-indigo-700 underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
