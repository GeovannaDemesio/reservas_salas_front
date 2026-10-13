import { encerrarSessao } from "@/lib/session";

export async function POST() {
  await encerrarSessao();
  return Response.json({ ok: true });
}
