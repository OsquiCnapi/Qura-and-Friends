// react-katex no publica tipos propios. Declaración mínima para BlockMath/InlineMath.
declare module "react-katex" {
  import type { ComponentType } from "react";
  export interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => JSX.Element;
  }
  export const BlockMath: ComponentType<KatexProps>;
  export const InlineMath: ComponentType<KatexProps>;
}
