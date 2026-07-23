import { useTranslations } from "next-intl";
import { Button } from "@quantum-party/ui";

/** Landing / boot. Enlaces al tablero y al laboratorio cuántico. */
export default function LandingPage() {
  const t = useTranslations();
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="bg-gradient-to-r from-[var(--color-superposition)] via-[var(--color-entanglement)] to-[var(--color-interference)] bg-clip-text text-6xl font-bold text-transparent">
          {t("app.title")}
        </h1>
        <p className="mt-3 text-lg text-[var(--color-quantum-muted)]">{t("app.subtitle")}</p>
      </div>

      <p className="max-w-xl text-balance text-[var(--color-quantum-text)]">{t("landing.description")}</p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <a href="/board">
          <Button size="lg">{t("landing.startLocal")}</Button>
        </a>
        <a href="/lab/bloch-gates">
          <Button size="lg" variant="outline">
            {t("landing.openLab")}
          </Button>
        </a>
      </div>
    </main>
  );
}
