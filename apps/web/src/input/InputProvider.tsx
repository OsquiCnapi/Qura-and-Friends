"use client";

import { useEffect } from "react";
import { startInput, stopInput } from "./inputManager.js";

/**
 * Monta/desmonta los listeners de teclado del singleton `inputManager`. No usa contexto de React
 * (para que el `GameLoop` dentro del <Canvas> pueda leer el input sin el problema del context-bridge).
 */
export function InputProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startInput();
    return () => stopInput();
  }, []);
  return <>{children}</>;
}
