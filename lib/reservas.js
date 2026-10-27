import "server-only";
import { backend } from "./backend";
import { ehAdmin, lerSessao } from "./session";

const erro = (mensagem, status) => Response.json({ erro: mensagem }, { status });

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function agora() {
  const hoje = new Date();
  return { data: hoje.toLocaleDateString("sv-SE"), hora: hoje.toTimeString().slice(0, 5) };
}

function validar(corpo) {
  const tipo = String(corpo.tipo ?? "");
  const cod = String(corpo.cod ?? "").trim();
  const data = String(corpo.data ?? "");
  const horaIni = String(corpo.hora_ini ?? "");
  const horaFim = String(corpo.hora_fim ?? "");
  const atual = agora();
  if (tipo !== "S" && tipo !== "L") return "Escolha o tipo de recurso.";
  if (!cod || cod.length > 3) return "Escolha o recurso.";
  if (!REGEX_DATA.test(data) || Number.isNaN(Date.parse(data))) return "Informe uma data válida.";
  if (!REGEX_HORA.test(horaIni) || !REGEX_HORA.test(horaFim)) return "Informe os horários de início e fim.";
  if (horaFim <= horaIni) return "O horário final deve ser maior que o inicial.";
  if (data < atual.data) return "A data não pode estar no passado.";
  if (data === atual.data && horaIni < atual.hora) return "O horário inicial não pode estar no passado.";
  return { tipo, cod, data, horaIni, horaFim };
}

export async function listar(parametros) {
  const sessao = await lerSessao();
  if (!sessao) return erro("Faça login para continuar.", 401);

  const consulta = new URLSearchParams();
  const data = parametros.get("data");
  const tipo = parametros.get("tipo");
  if (data && REGEX_DATA.test(data)) consulta.set("data", data);
  if (tipo === "S" || tipo === "L") consulta.set("tipo", tipo);
  for (const campo of ["usuario", "cod", "recurso"]) {
    const valor = (parametros.get(campo) ?? "").trim().slice(0, 100);
    if (valor) consulta.set(campo, valor);
  }

  const res = await backend(`/get/reserva?${consulta}`);
  if (!res.ok || !Array.isArray(res.dados)) return erro("Erro ao carregar as reservas.", 502);
  const admin = ehAdmin(sessao);
  return Response.json(
    res.dados.map((x) => ({
      cod: x.cod_reserva,
      tipo: x.tipo,
      codRecurso: x.cod_recurso,
      recurso: x.recurso_nome ?? x.cod_recurso,
      usuario: x.usuario_nome,
      data: x.data,
      horaIni: x.hora_ini,
      horaFim: x.hora_fim,
      status: x.status,
      podeCancelar: admin || x.cpf === sessao.cpf,
    })),
  );
}

export async function criar(req) {
  const sessao = await lerSessao();
  if (!sessao) return erro("Faça login para continuar.", 401);

  const corpo = await req.json().catch(() => ({}));
  const bloquear = corpo.bloquear === true;
  if (bloquear && !ehAdmin(sessao)) return erro("Apenas o administrador pode bloquear um recurso.", 403);

  const dados = validar(corpo);
  if (typeof dados === "string") return erro(dados, 400);

  const res = await backend("/post/reserva", "POST", {
    tipo: dados.tipo,
    cod_recurso: dados.cod,
    cpf: sessao.cpf,
    data: dados.data,
    hora_ini: dados.horaIni,
    hora_fim: dados.horaFim,
    status: bloquear ? "Bloqueado" : "Reservado",
  });
  if (res.status === 409 || res.status === 404) return erro(res.dados.erro, res.status);
  if (!res.ok) return erro("Não foi possível reservar agora.", 502);
  return Response.json({ mensagem: bloquear ? "Recurso bloqueado com sucesso!" : "Reserva realizada com sucesso!" }, { status: 201 });
}

export async function cancelar(cod) {
  const sessao = await lerSessao();
  if (!sessao) return erro("Faça login para continuar.", 401);
  if (!/^\d+$/.test(cod)) return erro("Reserva não encontrada.", 404);

  const atual = await backend(`/get/reserva/${cod}`);
  if (atual.status === 404) return erro("Reserva não encontrada.", 404);
  if (!atual.ok || !Array.isArray(atual.dados)) return erro("Não foi possível cancelar.", 502);
  if (!ehAdmin(sessao) && atual.dados[0].cpf !== sessao.cpf) {
    return erro("Você só pode cancelar as suas reservas.", 403);
  }

  const res = await backend(`/delete/id/reserva/${cod}`, "DELETE");
  if (!res.ok) return erro("Não foi possível cancelar.", 502);
  return Response.json({ mensagem: "Reserva cancelada com sucesso!" });
}
