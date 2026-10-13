import { ListaRecursos } from "@/components/ListaRecursos";

export default function LaboratoriosPage() {
  return <ListaRecursos titulo="Laboratórios" singular="laboratório" endpoint="/api/laboratorios" />;
}
