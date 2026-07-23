import { useTranslations } from "next-intl";
import { Button } from "@quantum-party/ui";

/**
 * Ruta de resultados independiente. En el flujo actual los resultados se muestran como overlay sobre
 * el propio minijuego (MinigameHost); esta página existe para navegación directa / futuros resúmenes.
 */
export default function ResultsPage() {
  const t = useTranslations("results");
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">{t("title")}</h1>
        <a href="/board">
          <Button>{t("backToBoard")}</Button>
        </a>
      </div>
    </main>
  );
}
