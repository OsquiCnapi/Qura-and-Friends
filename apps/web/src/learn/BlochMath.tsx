"use client";

import { BlockMath } from "react-katex";

/** Renderiza LaTeX con KaTeX (macros bra-ket adaptadas de qbronze_docs/.../mathjax_macros.md). */
export function BlochMath({ math }: { math: string }) {
  return <BlockMath math={math} />;
}
