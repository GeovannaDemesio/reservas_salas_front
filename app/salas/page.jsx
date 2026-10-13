import { ListaRecursos } from "@/components/ListaRecursos";

export default function SalasPage() {
  return <ListaRecursos titulo="Salas" singular="sala" endpoint="/api/salas" />;
}
