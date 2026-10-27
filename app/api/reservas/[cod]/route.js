import { cancelar } from "@/lib/reservas";

export async function DELETE(_req, ctx) {
  return cancelar((await ctx.params).cod);
}
