import { LABORATORIO, criar, listar } from "@/lib/recursos";

export async function GET() {
  return listar(LABORATORIO);
}

export async function POST(req) {
  return criar(LABORATORIO, req);
}
