import { redirect } from "next/navigation";

// A tela de salas redireciona para /login quando não há sessão.
export default function Home() {
  redirect("/salas");
}
