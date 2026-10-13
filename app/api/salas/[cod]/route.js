import { SALA, atualizar, excluir } from "@/lib/recursos";

export async function PUT(req, ctx) {
  return atualizar(SALA, (await ctx.params).cod, req);
}

export async function DELETE(_req, ctx) {
  return excluir(SALA, (await ctx.params).cod);
}
