"use client";

import React, {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { PRINT_SPEC, formatSizeMm, getNoPrintNote } from "@/lib/print-spec";
import { defaultPrintTransform } from "@/lib/print-position";
import { useLocale } from "@/app/components/LocaleProvider";
import type { DesignLayer, DesignState } from "@/lib/design-types";

/**
 * Produktansicht nur mit dem 3D-Modell (GLB) und dem Upload-Bereich (Jonny 21.11.2026).
 * Keine Produktfotos mehr. Motive liegen als Decal direkt auf dem Modell.
 */

const Shirt3D = dynamic(() => import("./Shirt3D"), {
  ssr: false,
  loading: () => (
    <div
      className="glb-studio-skeleton"
      role="status"
      aria-label="3D-Modell lädt"
    />
  ),
});

const TXT = {
  de: {
    front: "Vorderseite",
    back: "Rückseite",
    rotate: "360° drehen",
    stop: "Drehen stoppen",
    drop: "Bild hierher ziehen oder tippen",
    dropSub: "JPG, PNG oder WebP · beste Qualität ab {px} px",
    layer: "Bild {n}",
    size: "Größe",
    left: "Links",
    right: "Rechts",
    up: "Hoch",
    down: "Runter",
    horizontal: "Position waagrecht",
    vertical: "Position senkrecht",
    center: "Zentrieren",
    remove: "Entfernen",
    limit: "Maximal {n} Bilder pro Seite.",
    lowRes:
      "Auflösung niedrig ({w}×{h} px). Für scharfen Druck mindestens {px} px.",
    notImage:
      "Bitte eine Bilddatei wählen (JPG, PNG oder WebP). iPhone-Fotos (HEIC) bitte vorher als JPG speichern.",
    tooBig: "Die Datei ist größer als 25 MB. Bitte ein kleineres Bild wählen.",
    viewerError:
      "3D-Modell konnte nicht geladen werden. Bitte Seite neu laden.",
    printArea: "Druckfläche {size}",
    previewOnly: "Nur Vorschau: Dieser Artikel ist noch nicht bestellbar.",
  },
  ro: {
    front: "Față",
    back: "Spate",
    rotate: "Rotire 360°",
    stop: "Oprește rotirea",
    drop: "Trage imaginea aici sau atinge",
    dropSub: "JPG, PNG sau WebP · calitate optimă de la {px} px",
    layer: "Imagine {n}",
    size: "Mărime",
    left: "Stânga",
    right: "Dreapta",
    up: "Sus",
    down: "Jos",
    horizontal: "Poziție orizontală",
    vertical: "Poziție verticală",
    center: "Centrare",
    remove: "Elimină",
    limit: "Maximum {n} imagini pe față.",
    lowRes:
      "Rezoluție mică ({w}×{h} px). Pentru imprimare clară minimum {px} px.",
    notImage:
      "Te rugăm să alegi o imagine (JPG, PNG sau WebP). Pozele HEIC de pe iPhone salvează-le întâi ca JPG.",
    tooBig: "Fișierul depășește 25 MB. Alege o imagine mai mică.",
    viewerError: "Modelul 3D nu a putut fi încărcat. Reîncarcă pagina.",
    printArea: "Zonă de imprimare {size}",
    previewOnly:
      "Doar previzualizare: acest articol nu poate fi comandat încă.",
  },
  en: {
    front: "Front",
    back: "Back",
    rotate: "Rotate 360°",
    stop: "Stop rotation",
    drop: "Drop an image here or tap",
    dropSub: "JPG, PNG or WebP · best quality from {px} px",
    layer: "Image {n}",
    size: "Size",
    left: "Left",
    right: "Right",
    up: "Up",
    down: "Down",
    horizontal: "Horizontal position",
    vertical: "Vertical position",
    center: "Center",
    remove: "Remove",
    limit: "Maximum {n} images per side.",
    lowRes:
      "Low resolution ({w}×{h} px). For a sharp print use at least {px} px.",
    notImage:
      "Please choose an image file (JPG, PNG or WebP). Save iPhone photos (HEIC) as JPG first.",
    tooBig: "The file is larger than 25 MB. Please choose a smaller image.",
    viewerError: "The 3D model could not be loaded. Please reload the page.",
    printArea: "Print area {size}",
    previewOnly: "Preview only: this item cannot be ordered yet.",
  },
} as const;

const MAX_LAYERS_PER_SIDE = 6;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_EDGE_PX = 3000;
const genId = () => `L-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

class ViewerBoundary extends Component<
  { children: ReactNode; message: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="status" className="glb-studio-error">
        {this.props.message}
      </p>
    ) : (
      this.props.children
    );
  }
}

interface GlbStudioProps {
  /** Druckprofil: Shop-ID ("1", "2") oder "preview" für nicht bestellbare Katalogartikel */
  profileId: string;
  /** Direkter GLB-Pfad; leer = Modell der Shop-ID */
  modelPath?: string;
  productName: string;
  previewOnly?: boolean;
  /** Stofffarbe des Modells (z. B. Schwarz bei Baumwolle). Leer = Standard. */
  shirtColor?: string;
  onDesignChange?: (data: DesignState) => void;
}

export default function GlbStudio({
  profileId,
  modelPath,
  productName,
  previewOnly,
  shirtColor,
  onDesignChange,
}: GlbStudioProps) {
  const { locale } = useLocale();
  const tx =
    TXT[
      (locale as keyof typeof TXT) in TXT ? (locale as keyof typeof TXT) : "de"
    ];
  const [side, setSide] = useState<"front" | "back">("front");
  const [spinning, setSpinning] = useState(false);
  const [frontLayers, setFrontLayers] = useState<DesignLayer[]>([]);
  const [backLayers, setBackLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onDesignChange?.({ frontLayers, backLayers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontLayers, backLayers]);

  const layers = side === "front" ? frontLayers : backLayers;
  const setLayers = side === "front" ? setFrontLayers : setBackLayers;
  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const atLimit = layers.length >= MAX_LAYERS_PER_SIDE;

  const switchSide = (s: "front" | "back") => {
    setSide(s);
    setSpinning(false);
    const next = s === "front" ? frontLayers : backLayers;
    setSelectedId(next.length ? next[next.length - 1].id : null);
  };

  const addFile = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setHint(tx.notImage);
      return;
    }
    if (atLimit) {
      setHint(tx.limit.replace("{n}", String(MAX_LAYERS_PER_SIDE)));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setHint(tx.tooBig);
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = new window.Image();
    probe.onload = () => {
      const w = probe.naturalWidth,
        h = probe.naturalHeight;
      // Große Handyfotos auf max. 3000 px verkleinern: spart Speicher (Textur) und Upload-Größe,
      // 3000 px reichen für A4 bei rund 250 dpi.
      const scale = Math.min(1, MAX_EDGE_PX / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) {
        setHint(tx.notImage);
        return;
      }
      ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);
      const src =
        file.type === "image/jpeg"
          ? canvas.toDataURL("image/jpeg", 0.92)
          : canvas.toDataURL("image/png");
      setHint(
        Math.min(w, h) < PRINT_SPEC.minUploadPx
          ? tx.lowRes
              .replace("{w}", String(w))
              .replace("{h}", String(h))
              .replace("{px}", String(PRINT_SPEC.minUploadPx))
          : "",
      );
      const layer: DesignLayer = {
        id: genId(),
        kind: "image",
        src,
        transform: defaultPrintTransform(),
      };
      setLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
      setSpinning(false);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setHint(tx.notImage);
    };
    probe.src = url;
  };

  const update = (id: string, patch: Partial<DesignLayer["transform"]>) => {
    const limit = PRINT_SPEC.maxOffsetPercent;
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const t = { ...l.transform, ...patch };
        t.x = Math.max(-limit, Math.min(limit, t.x));
        t.y = Math.max(-limit, Math.min(limit, t.y));
        t.scale = Math.max(
          PRINT_SPEC.scaleMin,
          Math.min(PRINT_SPEC.scaleMax, t.scale),
        );
        return { ...l, transform: t };
      }),
    );
  };

  const remove = (id: string) => {
    const next = layers.filter((l) => l.id !== id);
    setLayers(next);
    if (selectedId === id)
      setSelectedId(next.length ? next[next.length - 1].id : null);
  };

  const toPrint = (ls: DesignLayer[]) =>
    ls.map((l) => ({
      id: l.id,
      src: l.src,
      x: l.transform.x,
      y: l.transform.y,
      scale: l.transform.scale,
    }));
  const frontPrint = useMemo(() => toPrint(frontLayers), [frontLayers]);
  const backPrint = useMemo(() => toPrint(backLayers), [backLayers]);

  return (
    <section className="glb-studio" aria-label={productName}>
      <div
        className={`glb-studio-viewer${dragOver ? " is-dragover" : ""}`}
        data-testid="glb-viewer"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="glb-studio-tabs" role="group">
          {(["front", "back"] as const).map((s) => {
            const count = (s === "front" ? frontLayers : backLayers).length;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={side === s && !spinning}
                className={`plt-tab${side === s && !spinning ? " plt-tab-active" : ""}`}
                onClick={() => switchSide(s)}
              >
                {s === "front" ? tx.front : tx.back}
                {count > 0 && (
                  <span className="glb-studio-dot" aria-label={`${count}`} />
                )}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={spinning}
            className={`plt-tab${spinning ? " plt-tab-active" : ""}`}
            onClick={() => setSpinning((v) => !v)}
          >
            {spinning ? tx.stop : tx.rotate}
          </button>
        </div>
        <ViewerBoundary message={tx.viewerError}>
          <Shirt3D
            productId={profileId}
            modelPath={modelPath}
            {...(shirtColor ? { shirtColor } : {})}
            facing={side}
            autoRotate={spinning}
            frontPrint={frontPrint}
            backPrint={backPrint}
          />
        </ViewerBoundary>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          addFile(e.target.files?.[0]);
          e.target.value = "";
        }}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
        data-testid="glb-upload-input"
      />
      <button
        type="button"
        className={`glb-studio-drop${dragOver ? " is-dragover" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFile(e.dataTransfer.files?.[0]);
        }}
        disabled={atLimit}
      >
        <span className="glb-studio-drop-icon" aria-hidden="true">
          ⬆
        </span>
        <span className="glb-studio-drop-title">
          {tx.drop} — {side === "front" ? tx.front : tx.back}
        </span>
        <span className="glb-studio-drop-sub">
          {tx.dropSub.replace("{px}", String(PRINT_SPEC.minUploadPx))}
        </span>
      </button>
      {hint && (
        <p role="alert" className="glb-studio-hint">
          {hint}
        </p>
      )}
      {previewOnly && <p className="glb-studio-note">{tx.previewOnly}</p>}

      {layers.length > 0 && (
        <ul className="glb-studio-layers">
          {layers.map((l, i) => (
            <li key={l.id} className={l.id === selectedId ? "is-selected" : ""}>
              <button
                type="button"
                aria-pressed={l.id === selectedId}
                onClick={() => setSelectedId(l.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Kundenmotiv als data-URL */}
                <img src={l.src} alt="" width={28} height={28} />
                {tx.layer.replace("{n}", String(i + 1))}
              </button>
              <button
                type="button"
                className="glb-studio-x"
                aria-label={`${tx.remove}: ${tx.layer.replace("{n}", String(i + 1))}`}
                onClick={() => remove(l.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="glb-studio-controls">
          <label htmlFor="glb-scale">
            {tx.size}{" "}
            <span>{Math.round(selected.transform.scale * 100)} %</span>
          </label>
          <input
            id="glb-scale"
            type="range"
            min={PRINT_SPEC.scaleMin}
            max={PRINT_SPEC.scaleMax}
            step={0.05}
            value={selected.transform.scale}
            onChange={(e) =>
              update(selected.id, { scale: Number(e.target.value) })
            }
          />
          <label htmlFor="glb-x">{tx.horizontal}</label>
          <input
            id="glb-x"
            type="range"
            min={-PRINT_SPEC.maxOffsetPercent}
            max={PRINT_SPEC.maxOffsetPercent}
            step={1}
            value={selected.transform.x}
            onChange={(e) => update(selected.id, { x: Number(e.target.value) })}
          />
          <label htmlFor="glb-y">{tx.vertical}</label>
          <input
            id="glb-y"
            type="range"
            min={-PRINT_SPEC.maxOffsetPercent}
            max={PRINT_SPEC.maxOffsetPercent}
            step={1}
            value={-selected.transform.y}
            aria-valuetext={`${Math.round(-selected.transform.y)}`}
            onChange={(e) =>
              update(selected.id, { y: -Number(e.target.value) })
            }
          />
          <div className="glb-studio-row">
            <button
              type="button"
              className="plt-btn-secondary"
              onClick={() => update(selected.id, { x: 0, y: 0 })}
            >
              {tx.center}
            </button>
            <button
              type="button"
              className="plt-btn-secondary glb-studio-remove"
              onClick={() => remove(selected.id)}
            >
              {tx.remove}
            </button>
          </div>
          {!previewOnly && (
            <p className="glb-studio-note">
              {tx.printArea.replace("{size}", formatSizeMm())} ·{" "}
              {getNoPrintNote(profileId)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
