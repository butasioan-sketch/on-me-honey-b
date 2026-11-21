import type { PrintTransform } from "./print-position";

/** Kundenmotiv-Ebene (Bild oder Text) mit eigener Position/Größe auf der Druckfläche. */
export interface DesignLayer {
  id: string;
  kind: "image" | "text";
  src: string;
  transform: PrintTransform;
  text?: string;
  color?: string;
}

export interface DesignState {
  frontLayers: DesignLayer[];
  backLayers: DesignLayer[];
}
