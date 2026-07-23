import { getRequestConfig } from "next-intl/server";

/**
 * Configuración de next-intl. Este entregable es monolingüe (español); la estructura permite añadir
 * más locales luego. El copy pedagógico y narrativo de "alto nivel" vive en messages/<locale>.json.
 */
export const locales = ["es"] as const;
export const defaultLocale = "es";

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
