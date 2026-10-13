import { backend } from "@/lib/backend";
import { cpfValido, soDigitos } from "@/lib/cpf";
import { criarSessao } from "@/lib/session";

export async function POST(req) {
  const { cpf: cpfBruto, senha } = await req.json().catch(() => ({}));
  const cpf = soDigitos(String(cpfBruto ?? ""));
  if (!cpfValido(cpf) || !senha) {
    return Response.json({ erro: "Informe um CPF válido e a senha." }, { status: 400 });
  }
  const res = await backend("/post/login", "POST", { cpf, senha });
  if (res.status === 401) return Response.json({ erro: "CPF ou senha inválidos." }, { status: 401 });
  if (!res.ok) return Response.json({ erro: "Não foi possível entrar agora." }, { status: 502 });
  await criarSessao({ cpf: res.dados.cpf, nome: res.dados.nome });
  return Response.json({ nome: res.dados.nome });
}
