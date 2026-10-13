import { ehAdmin, lerSessao } from "@/lib/session";

export async function GET() {
  const sessao = await lerSessao();
  if (!sessao) return Response.json({ erro: "Não autenticado." }, { status: 401 });
  return Response.json({ nome: sessao.nome, cpf: sessao.cpf, admin: ehAdmin(sessao) });
}
