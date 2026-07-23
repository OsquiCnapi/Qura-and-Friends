import { MinigameHost } from "@/game/MinigameHost.js";

/** Host genérico de minijuego. Ejemplo: /play/cat-race */
export default async function PlayPage({
  params,
}: {
  params: Promise<{ minigameId: string }>;
}) {
  const { minigameId } = await params;
  return <MinigameHost minigameId={minigameId} />;
}
