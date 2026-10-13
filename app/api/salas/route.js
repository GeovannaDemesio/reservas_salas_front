import { SALA, criar, listar } from "@/lib/recursos";

export async function GET() {
  return listar(SALA);
}

export async function POST(req) {
  return criar(SALA, req);
}
