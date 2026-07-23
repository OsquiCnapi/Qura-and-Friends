import { clsx, type ClassValue } from "clsx";

/** Helper de composición de clases Tailwind. */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);
