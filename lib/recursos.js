import "server-only";
import { backend } from "./backend";
import { ehAdmin, lerSessao } from "./session";

// Sala e laboratório têm o mesmo formato; só mudam o código da chave e as rotas do back.
export const SALA = { nomeSingular: "Sala", chave: "cod_sala", rotaBack: "sala" };
export const LABORATORIO = { nomeSingular: "Laboratório", chave: "cod_lab", rotaBack: "laboratorio" };

const erro = (mensagem, status) => Response.json({ erro: mensagem }, { status });

// Devolve a mensagem de erro (string) ou os dados já limpos
function validar(corpo, exigeCodigo) {
  const cod = String(corpo.cod ?? "").trim();
  const nome = String(corpo.nome ?? "").trim();
  const loc = String(corpo.loc ?? "").trim();
  const cap = Number(corpo.cap);
  if (exigeCodigo && (!cod || cod.length > 3)) return "O código deve ter de 1 a 3 caracteres.";
  if (!nome || nome.length > 50) return "O nome deve ter de 1 a 50 caracteres.";
  if (!Number.isInteger(cap) || cap <= 0 || cap > 2147483647) return "A capacidade deve ser um número inteiro maior que zero.";
  if (!loc || loc.length > 55) return "A localização deve ter de 1 a 55 caracteres.";
  return { cod, nome, cap, loc };
}

// Exige usuário logado E administrador (CPF em ADMIN_CPF). 
async function exigirAdmin() {
  const sessao = await lerSessao();
  if (!sessao) return erro("Faça login para continuar.", 401);
  if (!ehAdmin(sessao)) return erro("Apenas o administrador pode alterar salas e laboratórios.", 403);
  return null;
}

export async function listar(r) {
  if (!(await lerSessao())) return erro("Faça login para continuar.", 401);
  const res = await backend(`/get/${r.rotaBack}`);
  if (!res.ok || !Array.isArray(res.dados)) return erro("Erro ao carregar a lista.", 502);
  return Response.json(
    res.dados.map((x) => ({ cod: x[r.chave], nome: x.nome, cap: x.cap, loc: x.loc })),
  );
}

export async function criar(r, req) {
  const negado = await exigirAdmin();
  if (negado) return negado;
  const dados = validar(await req.json().catch(() => ({})), true);
  if (typeof dados === "string") return erro(dados, 400);
  const res = await backend(`/post/${r.rotaBack}`, "POST", {
    [r.chave]: dados.cod,
    nome: dados.nome,
    cap: dados.cap,
    loc: dados.loc,
  });
  if (!res.ok) return erro("Não foi possível cadastrar. Esse código já existe?", 400);
  return Response.json({ mensagem: "Cadastro realizado com sucesso!" }, { status: 201 });
}

export async function atualizar(r, cod, req) {
  const negado = await exigirAdmin();
  if (negado) return negado;
  const dados = validar(await req.json().catch(() => ({})), false);
  if (typeof dados === "string") return erro(dados, 400);
  const res = await backend(`/put/id/${r.rotaBack}/${encodeURIComponent(cod)}`, "PUT", {
    nome: dados.nome,
    cap: dados.cap,
    loc: dados.loc,
  });
  if (!res.ok) return erro("Não foi possível atualizar.", 502);
  return Response.json({ mensagem: "Atualizado com sucesso!" });
}

export async function excluir(r, cod) {
  const negado = await exigirAdmin();
  if (negado) return negado;
  const res = await backend(`/delete/id/${r.rotaBack}/${encodeURIComponent(cod)}`, "DELETE");
  if (!res.ok) return erro("Não foi possível excluir. Pode haver reservas vinculadas.", 502);
  return Response.json({ mensagem: "Excluído com sucesso!" });
}
