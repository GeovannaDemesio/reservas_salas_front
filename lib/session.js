import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "reserva_session";
const DURACAO_SEGUNDOS = 60 * 60 * 8;

function segredo() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET ausente ou curto demais (mín. 32 caracteres)");
  return s;
}

function assinar(payload) {
  return createHmac("sha256", segredo()).update(payload).digest("base64url");
}

// sessao: { cpf, nome }
export async function criarSessao(sessao) {
  const payload = Buffer.from(
    JSON.stringify({ ...sessao, exp: Date.now() + DURACAO_SEGUNDOS * 1000 }),
  ).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${assinar(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

// Devolve { cpf, nome } ou null
export async function lerSessao() {
  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return null;
  const [payload, assinatura] = valor.split(".");
  if (!payload || !assinatura) return null;
  const esperado = Buffer.from(assinar(payload));
  const recebido = Buffer.from(assinatura);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof dados.exp !== "number" || dados.exp < Date.now()) return null;
    return { cpf: String(dados.cpf), nome: String(dados.nome) };
  } catch {
    return null;
  }
}

export function ehAdmin(sessao) {
  return !!sessao && sessao.cpf === process.env.ADMIN_CPF;
}
