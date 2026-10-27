import { criar, listar } from "@/lib/reservas";

export async function GET(req) {
  return listar(new URL(req.url).searchParams);
}

export async function POST(req) {
  return criar(req);
}
