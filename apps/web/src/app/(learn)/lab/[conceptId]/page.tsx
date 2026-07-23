import { getConcept } from "@quantum-party/curriculum";
import { LabView } from "@/learn/LabView.js";

/** Laboratorio de un concepto. Ejemplo: /lab/bloch-gates */
export default async function LabPage({
  params,
}: {
  params: Promise<{ conceptId: string }>;
}) {
  const { conceptId } = await params;
  const concept = getConcept(conceptId);
  return <LabView concept={concept} />;
}
