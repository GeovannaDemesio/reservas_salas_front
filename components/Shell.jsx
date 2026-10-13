"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// Usuário logado: { nome, cpf, admin }
const UsuarioContext = createContext(null);

export function useUsuario() {
  const usuario = useContext(UsuarioContext);
  if (!usuario) throw new Error("useUsuario deve ser usado dentro de <Shell>");
  return usuario;
}

// Moldura das telas autenticadas: carrega a sessão, redireciona para /login se não houver
// e mostra o menu. A proteção real dos dados fica nas rotas /api (lib/recursos.js).
export function Shell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then(async (res) => {
      if (res.ok) setUsuario(await res.json());
      else router.replace("/login");
    });
  }, [router]);

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!usuario) {
    return <p className="m-auto text-white">Carregando…</p>;
  }

  const link = (href, texto) => (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        pathname === href ? "bg-indigo-700 text-white" : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {texto}
    </Link>
  );

  return (
    <UsuarioContext value={usuario}>
      <header className="bg-white shadow">
        <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 font-semibold text-indigo-900">Reserva de Salas</span>
          {link("/salas", "Salas")}
          {link("/laboratorios", "Laboratórios")}
          <span className="ml-auto text-sm text-zinc-600">
            {usuario.nome}
            {usuario.admin && " (admin)"}
          </span>
          <button onClick={sair} className="rounded-lg px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">
            Sair
          </button>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </UsuarioContext>
  );
}
