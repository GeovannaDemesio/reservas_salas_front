import { backend } from "@/lib/backend";
import { cpfValido, soDigitos } from "@/lib/cpf";
import { criarSessao } from "@/lib/session";

function erro(mensagem, status = 400) {
  return Response.json({ erro: mensagem }, { status });
}

export async function POST(req) {
  const c = await req.json().catch(() => ({}));
  const cpf = soDigitos(String(c.cpf ?? ""));
  const nome = String(c.nome ?? "").trim();
  const email = String(c.email ?? "").trim();
  const celular = soDigitos(String(c.celular ?? ""));
  const dt_nasc = String(c.dt_nasc ?? "");
  const senha = String(c.senha ?? "");

  if (!nome || nome.length > 100) return erro("Informe o nome (até 100 caracteres).");
  if (!cpfValido(cpf)) return erro("CPF inválido.");
  if (email.length > 55 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erro("E-mail inválido (até 55 caracteres).");
  if (celular.length < 10 || celular.length > 11) return erro("Celular inválido (DDD + número).");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dt_nasc) || Number.isNaN(Date.parse(dt_nasc))) {
    return erro("Data de nascimento inválida (o ano deve ter 4 dígitos).");
  }
  if (dt_nasc < "1900-01-01" || dt_nasc > new Date().toLocaleDateString("sv-SE")) {
    return erro("Data de nascimento fora do período permitido.");
  }
  if (senha.length < 6) return erro("A senha deve ter ao menos 6 caracteres.");

  const res = await backend("/post/usuario", "POST", { nome, cpf, dt_nasc, email, celular, senha });
  if (!res.ok) return erro("Não foi possível cadastrar. CPF ou e-mail já cadastrado?", 409);

  await criarSessao({ cpf, nome });
  return Response.json({ nome }, { status: 201 });
}
