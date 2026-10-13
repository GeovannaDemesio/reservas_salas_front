import "server-only";

const BASE = process.env.BACKEND_URL ?? "http://localhost:3001";

// Devolve { ok, status, dados }
export async function backend(caminho, metodo = "GET", corpo) {
  try {
    const res = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: corpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      cache: "no-store",
    });
    const dados = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, dados };
  } catch {
    return { ok: false, status: 503, dados: { erro: "Servidor indisponível." } };
  }
}
