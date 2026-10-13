import { LABORATORIO, atualizar, excluir } from "@/lib/recursos";

export async function PUT(req, ctx) {
  return atualizar(LABORATORIO, (await ctx.params).cod, req);
}

export async function DELETE(_req, ctx) {
  return excluir(LABORATORIO, (await ctx.params).cod);
}
