// Minimal types for troika-three-text. The package ships JSDoc-generated
// declarations (dist/types) that miss that Text extends Mesh and type
// anchorX/anchorY as numbers only, so declare the parts the scene uses.
declare module "troika-three-text" {
  import type { Material, Mesh } from "three";

  export interface TextRenderInfo {
    /** [minX, minY, maxX, maxY] of the laid-out text block, in local units. */
    blockBounds: [number, number, number, number];
  }

  export class Text extends Mesh {
    text: string;
    font: string | null;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number | "normal";
    maxWidth: number;
    whiteSpace: "normal" | "nowrap";
    anchorX: number | "left" | "center" | "right" | `${number}%`;
    anchorY: number | "top" | "top-baseline" | "top-cap" | "top-ex" | "middle" | "bottom-baseline" | "bottom" | `${number}%`;
    color: string | number | null;
    material: Material;
    readonly textRenderInfo: TextRenderInfo | null;
    sync(callback?: () => void): void;
    dispose(): void;
  }
}
