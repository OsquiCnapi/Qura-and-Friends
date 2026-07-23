import { Navbar } from "@/components/layout/navbar.js";
import { Hero } from "@/components/marketing/hero/hero.js";
import { FeatureSection } from "@/components/marketing/features/feature-section.js";

/** Landing / boot de Qura and Friends. Navbar + hero + secciones de features. */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureSection />
      </main>
    </>
  );
}
